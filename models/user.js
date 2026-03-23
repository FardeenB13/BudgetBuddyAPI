import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
});

export default mongoose.model("User", userSchema);
