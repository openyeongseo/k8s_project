package com.geunuk.point.dto.response;

import lombok.Getter;

@Getter
public class ApiResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private ApiResponse(boolean success, String message, T data) {
        this.success = success; this.message = message; this.data = data;
    }
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, "OK", data); }
    public static <T> ApiResponse<T> ok(String msg, T data) { return new ApiResponse<>(true, msg, data); }
    public static <T> ApiResponse<T> fail(String msg) { return new ApiResponse<>(false, msg, null); }
}
