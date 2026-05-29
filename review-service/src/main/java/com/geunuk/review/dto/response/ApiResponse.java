package com.geunuk.review.dto.response;
import lombok.Getter;
@Getter
public class ApiResponse<T> {
    private final boolean success; private final String message; private final T data;
    private ApiResponse(boolean s, String m, T d) { success=s; message=m; data=d; }
    public static <T> ApiResponse<T> ok(T d) { return new ApiResponse<>(true,"OK",d); }
    public static <T> ApiResponse<T> ok(String m, T d) { return new ApiResponse<>(true,m,d); }
    public static <T> ApiResponse<T> fail(String m) { return new ApiResponse<>(false,m,null); }
}
