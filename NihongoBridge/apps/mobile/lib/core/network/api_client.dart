import 'package:dio/dio.dart';
import '../database/sqlite_service.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  final Dio dio = Dio(
    BaseOptions(
      baseUrl: "https://nihongobridge.vercel.app/api/v1",
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  )..interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Retrieve and attach bearer JWT tokens automatically
          final token = await SqliteService().getSessionToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Unified global network error catcher
          print("⚠️ Network API Error: ${e.response?.statusCode} - ${e.message}");
          return handler.next(e);
        },
      ),
    );

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) async {
    return await dio.post(path, data: data);
  }
}
