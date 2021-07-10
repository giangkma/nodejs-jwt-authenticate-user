/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../domain/auth.domain';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            private: true,
        },
        role: {
            type: String,
            default: 'student',
        },
        score: {
            type: Array,
            default: [0, 0, 0, 0, 0],
        },
        avatar: {
            type: String,
            default: '',
        },
    },
    { versionKey: false },
);

UserSchema.set('toJSON', {
    transform: function (doc: Document, ret: any) {
        ret.id = ret._id;
        delete ret._id;
    },
});

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
UserSchema.methods.isPasswordMatch = async function (password: string) {
    const user = this as IUser;
    return bcrypt.compare(password, user.password);
};

UserSchema.pre('save', async function (next) {
    const user = this as IUser;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User: Model<IUser> = mongoose.model('User', UserSchema);

export default User;
