import mongoose , {Schema} from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; //Ye package specially use hota hai MongoDB Aggregation queries ke results ko paginate (page-wise divide) karne ke liye.
const videoSchema = new Schema(
    {
       videoFile: {
        
       }
     
     


},{

  timeStamps: true

})

videoSchema.plugin(mongooseAggregatePaginate) // Mongoose me plugin ek feature hai jisme hum schema ke saath extra functionality attach kar dete hain,Matlab tum apne schema ko normal use kar sakte ho, but plugin lagane ke baad tumhe extra methods mil jaate hain.
export const Video = mongoose.model("Video", videoSchema) 