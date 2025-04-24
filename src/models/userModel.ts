import mongoose, { Document, Schema } from 'mongoose';

// Define an interface for the User document
 export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Define the user schema with better types
const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] }
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt fields
  }
);

// Create and export the model using the IUser interface
const User = mongoose.model<IUser>('User', userSchema);

export default User;
