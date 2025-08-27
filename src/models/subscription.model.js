import mongoose, {Schema} from "mongoose"
import { User } from "./user.models"

const subscriptionSchema = new Schema({
 subsciber : {
    type: Schema.Types.ObjectId, //one who is subscribing
    ref: "User"
 },

 channel: {
    type: Schema.Types.ObjectId, //one to whom 'subsciber' is subscribing
    ref: "User"
 }
}, {timestamps: true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema);
