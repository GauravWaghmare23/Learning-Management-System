import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    },
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
    signAccessToken: () => string;
    signRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegex.test(value);
            },
            message: "Please enter a valid email"
        },
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        minlength: [8, "Password must be at least 8 characters long"],
        select: false,
        required: false,
    },
    avatar: {
        public_id: {
            type: String,
            default: "",
        },
        url: {
            type: String,
            default: "",
        },
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ]
}, { timestamps: true });

// hash password before saving
userSchema.pre("save", async function () {

    if (!this.password) {
        return;
    }

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(
        this.password,
        10
    );
});

userSchema.methods.signAccessToken = function (): string {
    return jwt.sign({ _id: this._id }, process.env.JWT_ACCESS_SECRET as Secret, { expiresIn: "15m" });
}

userSchema.methods.signRefreshToken = function (): string {
    return jwt.sign({ _id: this._id }, process.env.JWT_REFRESH_SECRET as Secret, { expiresIn: "7d" });
}

// compare password method
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;