import ApiClient from "@/lib/ApiClient";
import type { DataResponse } from "@/types/api-contract";
import type { LoginRequest, LoginResponse } from "@/types/loginDto";

export const signinApi = async (data: LoginRequest) => {
    const response = await ApiClient.post<DataResponse<LoginResponse>>(
        "/auth/login",
        data
    );

    return response.data;
};
