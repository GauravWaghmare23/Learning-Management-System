import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

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
        required: [true, "Please enter your password"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false,
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
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(
        this.password,
        10
    );
});

// compare password method
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;