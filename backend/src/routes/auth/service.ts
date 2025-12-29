// import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { ENV } from "@/configs";
import type { DataResponse } from "@/types/api-contract";
import type { LoginRequest, LoginResponse } from "./dto";
import HTTP_STATUS from "@/types/status-codes";
import { ApiError } from "@/types/api-contract";
// import { AdminRepository } from "@/database/repositories";

// const adminRepository = new AdminRepository();

export async function loginService(
    loginData: LoginRequest
): Promise<DataResponse<LoginResponse>> {
    const { username, password } = loginData;

    if (username !== "admin") {
        throw new ApiError(
            "Invalid username or password",
            HTTP_STATUS.UNAUTHORIZED
        );
    }

    if (password !== "Secret") {
        throw new ApiError(
            "Invalid username or password",
            HTTP_STATUS.UNAUTHORIZED
        );
    }

    // // Find admin by username
    // const adminUser = await adminRepository.findByUsername(username);

    // if (!adminUser) {
    //     throw new ApiError(
    //         "Invalid username or password",
    //         HTTP_STATUS.UNAUTHORIZED
    //     );
    // }

    // // Verify password
    // const isValidPassword = await argon2.verify(adminUser.password, password);

    // if (!isValidPassword) {
    //     throw new ApiError(
    //         "Invalid username or password",
    //         HTTP_STATUS.UNAUTHORIZED
    //     );
    // }

    const adminUser = {
        id: 1,
        username: username,
    };

    // Generate JWT token
    const token = jwt.sign(
        { id: adminUser.id, username: adminUser.username },
        ENV.JWT_SECRET,
        { expiresIn: "24h" }
    );

    return {
        message: "Login successful",
        status: HTTP_STATUS.OK,
        data: {
            token,
            username: adminUser.username,
        },
    };
}
