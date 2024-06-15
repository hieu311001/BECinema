import { Injectable } from "@nestjs/common";
import { Showtime, ShowtimeDocument } from "./schemas/showtime.schemas";
import { CreateShowtimeDto, ShowtimeOptionsDto, UpdateShowtimeDto } from "./dto/showtime.dto";
import { IUser } from "src/users/users.interface";
import { Order } from "src/common/enum";
import * as _ from 'lodash';
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import { CommonService } from "src/common/common-mongoose.service";
import aqp from "api-query-params";

@Injectable()
export class ShowtimesService extends CommonService<Showtime> {
  constructor(
    @InjectModel(Showtime.name)
    private readonly showtimeModel: Model<Showtime>,
  ) { 
    super(showtimeModel);
  }

  async create(createShowtimeDto: CreateShowtimeDto, user: IUser) {
    const {dateStart, film, room, cinema} = createShowtimeDto;
    let newSeats = [
      ...Array.from({ length: 10 }, (_, i) => ({ _id: `A${i + 1}`, price: 60000, status: 'READY' })),
      ...Array.from({ length: 10 }, (_, i) => ({ _id: `B${i + 1}`, price: 60000, status: 'READY' })),
      ...Array.from({ length: 10 }, (_, i) => ({ _id: `C${i + 1}`, price: 70000, status: 'READY' })),
      ...Array.from({ length: 10 }, (_, i) => ({ _id: `D${i + 1}`, price: 70000, status: 'READY' })),
      ...Array.from({ length: 10 }, (_, i) => ({ _id: `E${i + 1}`, price: 70000, status: 'READY' })),
      ...Array.from({ length: 10 }, (_, i) => ({ _id: `F${i + 1}`, price: 65000, status: 'READY' })),
      ...Array.from({ length: 10 }, (_, i) => ({ _id: `G${i + 1}`, price: 65000, status: 'READY' })),
    ];
    const endDate = new Date(dateStart);
    endDate.setMinutes(endDate.getMinutes() + (film.time + 15));
    let newShowtime = await this.showtimeModel.create({
      dateStart, seats: newSeats,
      dateEnd: endDate,
      film, room, cinema,
       createdBy: {
        _id: user._id,
        email: user.email,
      }
    });
    return {
      _id: newShowtime?._id,
      name: dateStart + room.name + film.name,
      dateStart,
      dateEnd: endDate,
      film,
      room,
      cinema,
      seats: newSeats,
      createAt: newShowtime?.createdAt,
    }
  }

  async update(id: string, upadteShowtimeDto: UpdateShowtimeDto, user: IUser) {

    return await this.showtimeModel.updateOne(
      { _id: id },
      {
        ...upadteShowtimeDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        }
      })
  }

  async findByRoomId(roomId: string) {
    return await this.showtimeModel.find({ "room._id": roomId }).exec();
  }

  async getById(id: string) {
    return this.showtimeModel.findById(id).exec();
  }

  // async remove(id: string, user: IUser) {
  //   await this.showtimeModel.updateOne(
  //     { _id: id },
  //     {
  //       deletedBy: {
  //         _id: user._id,
  //         email: user.email,
  //       }
  //     })
  //   return this.showtimeModel.softDelete({ _id: id });
  // }

  async selectSteat(id: string, seats:
    {
      id: string,
      status: string
    }[], user: IUser) {
    return await this.showtimeModel.updateOne(
      { _id: id },
      {
        ...seats,
        updatedBy: {
          _id: user._id,
          email: user.email,
        }
      }
    )
  }
  
  // async getShowtimeByDate(startDate: Date, endDate:Date, q: string) {
  //   let conditions: Record<string, any> = q
  //     ? {
  //       $or: [{ class: Number(q) }, { subject: { $regex: q, $options: 'i' } }]
  //     }
  //     : {};
  //   if (startDate) {
  //     const filterTime = [
  //       {
  //         date: startDate
  //       },
  //       {
  //         date: { $gt: startDate }
  //       }
  //     ];
  //     conditions = { $and: [conditions, { $or: filterTime }] };
  //   }

  //   if (endDate) {
  //     const filterTime = [
  //       {
  //         date: endDate
  //       },
  //       {
  //         date: { $lt: endDate }
  //       }
  //     ];
  //     if (!Array.isArray(conditions.$and)) {
  //       conditions = { $and: [conditions, { $or: filterTime }] };
  //     } else {
  //       conditions.$and.push({ $or: filterTime });
  //     }
  //   }
  //   const [total, items] = await Promise.all([
  //     this.showtimeModel.countDocuments(conditions),
  //     this.showtimeModel.find(conditions)
  //   ]);
  //   return{ items, total}
  // }
  async getShowtimesInRange(dateStart: Date, dateEnd: Date): Promise<Showtime[]> {
    const conditions = {
      dateStart: { $gte: dateStart },
      dateEnd: { $lte: dateEnd }
    };
    return await this.showtimeModel.find(conditions);
  }
  async getShowtimesByFilmId(filmId: mongoose.Schema.Types.ObjectId) {
    return await this.showtimeModel.findOne({ "film._id": filmId });
  }

  async getShowtimesByFilmAndRoomId(filmId: mongoose.Schema.Types.ObjectId, roomId: mongoose.Schema.Types.ObjectId) {
    return await this.showtimeModel.find({ "film._id": filmId, "room._id": roomId });
  }

  async pagination(pageOptionsDto: ShowtimeOptionsDto) {
    const {
      limit,
      order = Order.DESC,
      page,
      q,
      orderField,
      date,
      filmId,
      cinemaId,
      orderDate,
      available
    } = pageOptionsDto;
    let conditions: Record<string, any> = q
      ? {
        $or: [{ class: Number(q) }, { subject: { $regex: q, $options: 'i' } }]
      }
      : {};
    const options = {
      skip: (page - 1) * limit,
      limit: limit
    };
    if (filmId) conditions = { ...conditions, "film._id": filmId };
    if (cinemaId) conditions = { ...conditions, "cinema._id": cinemaId };
    let sort = orderField
      ? {
        [orderField]: order === Order.DESC ? -1 : 1
      }
      : {};
    if (orderDate) {
      const sortDate =
        orderDate === Order.DESC
          ? {
            date: -1
          }
          : {
            date: 1
          };
      sort = { ...sort, ...sortDate };
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions = { ...conditions, dateStart: { $gte: startOfDay, $lte: endOfDay } };
    }
    const [total, items] = await Promise.all([
      this.showtimeModel.countDocuments(conditions),
      this.showtimeModel.find(conditions, null, options).sort().select("-seats")
    ]);
    return { items, total };
  }

  async findAllShowTime(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.showtimeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.showtimeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort()
      .select("-seats")
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findAllShowTimeByDate(currentPage: number, limit: number, date: Date, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conditions = {
      dateStart: { $gte: startOfDay, $lte: endOfDay }
    };

    const totalItems = (await this.showtimeModel.find(conditions)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.showtimeModel.find(conditions)
      .skip(offset)
      .limit(defaultLimit)
      .sort()
      .select("-seats")
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  // async findAllShowTimeByDate(date: Date) {
  //   const startOfDay = new Date(date);
  //   startOfDay.setHours(0, 0, 0, 0);
  //   const endOfDay = new Date(date);
  //   endOfDay.setHours(23, 59, 59, 999);
  //   const conditions = {
  //     dateStart: { $gte: startOfDay, $lte: endOfDay }
  //   };
  //   const showtimes = await this.showtimeModel.find(conditions);
  //   return showtimes;
  // }
  
  async findShowtimesByFilmAndRoom(filmId: string, roomId: string): Promise<any> {
    // Find showtimes that match the filmId and roomId
    const showtimes = await this.showtimeModel.find({ filmId, roomId });
  
    return showtimes;
  }
 
}
