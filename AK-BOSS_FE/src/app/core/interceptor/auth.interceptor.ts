// error-handling.interceptor.ts

import { HttpErrorResponse, HttpResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { CustomError } from '../module/models';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LoaderService } from '../services/loader.service';


export const AppInterceptor: HttpInterceptorFn = (request, next) => {
  // Get the JWT token from wherever you store it (localStorage, cookies, etc.)
  const toastr = inject(ToastrService)
  const router = inject(Router)
  const loaderService = inject(LoaderService);
  const sessionStorageService = inject(StorageService);
  const jwtToken = sessionStorageService.getItem('authToken'); // Example: Retrieve from localStorage
  // Clone the request and add the Authorization header with the JWT
    // ✅ check if FormData
  const isFormData = request.body instanceof FormData;
    const headers: any = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0'
  };

    if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
    // ❗ ONLY set JSON header if NOT FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const modifiedRequest = request.clone({
    setHeaders: headers
  });


    loaderService.show();
  return next(modifiedRequest).pipe(
    tap((response) => {
      if (response instanceof HttpResponse) {
        // Extract the JSON data and return it
        const jsonData = response.body as CustomError;
        if (jsonData && jsonData.code && jsonData.code == 200) {
          return jsonData.data;
        } else if (jsonData && jsonData.code && jsonData.code == 401) {
          sessionStorageService.removeItem('authToken');
          sessionStorageService.clear();
          toastr.error("Session expired. Please login again.", "Unauthorized");
          router.navigate(['/auth/login']);
          return throwError(() => new CustomError(jsonData.message, jsonData.code, null));
        } else {
          return throwError(() => new CustomError(jsonData.message, jsonData.code, null));
        }
      }
      return throwError(() => new CustomError("Response format not recognized_" + response.type, 200, null));

    }),
    catchError((error: HttpErrorResponse) => {
      if (error && error.headers && !error.headers.get('content-type')?.includes('application/json')) {
        return throwError(() => new CustomError(error.statusText ?? "Response format not recognized", error.status, null));
      }

       else if (error && error.statusText === "Unauthorized" && error.status == 401) {
          sessionStorageService.removeItem('authToken');
          sessionStorageService.clear();
          toastr.error("Session expired. Please login again.", "Unauthorized");
          router.navigate(['/auth/login']);
          return throwError(() => new CustomError(error.message, error.status, null));
        }

      if (error.error instanceof ErrorEvent) {
        return throwError(() => new CustomError(error.statusText ?? "Client-side error", error.status, error.error));
      } else {
        return throwError(() => new CustomError(error.statusText ?? "Server-side error", error.status, error.error));
      }
    }),
     finalize(() => {
      loaderService.hide();
    })
  );

};




