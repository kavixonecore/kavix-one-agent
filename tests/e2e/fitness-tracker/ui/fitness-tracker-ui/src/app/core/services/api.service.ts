import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import type { Observable } from "rxjs";
import type {
  ApiResponse,
  IExercise,
  ICreateExercise,
  IExerciseQuery,
  IWorkout,
  ICreateWorkout,
  IWorkoutQuery,
  IProgressMetric,
  ICreateProgressMetric,
  IProgressMetricQuery,
  IRunningLog,
  ICreateRunningLog,
  IRunningLogQuery,
  IPersonalBests,
  IWorkoutExercise,
  ICreateWorkoutExercise,
} from "../../interfaces";

@Injectable({ providedIn: "root" })
export class ApiService {

  private readonly http = inject(HttpClient);
  private readonly base = "/api";

  // --- Exercises ---

  getExercises(query?: IExerciseQuery): Observable<ApiResponse<IExercise[]>> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<IExercise[]>>(`${this.base}/exercises`, { params });
  }

  getExercise(id: string): Observable<ApiResponse<IExercise>> {
    return this.http.get<ApiResponse<IExercise>>(`${this.base}/exercises/${id}`);
  }

  createExercise(body: ICreateExercise): Observable<ApiResponse<IExercise>> {
    return this.http.post<ApiResponse<IExercise>>(`${this.base}/exercises`, body);
  }

  updateExercise(id: string, body: Partial<ICreateExercise>): Observable<ApiResponse<IExercise>> {
    return this.http.put<ApiResponse<IExercise>>(`${this.base}/exercises/${id}`, body);
  }

  deleteExercise(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.base}/exercises/${id}`);
  }

  // --- Workouts ---

  getWorkouts(query?: IWorkoutQuery): Observable<ApiResponse<IWorkout[]>> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<IWorkout[]>>(`${this.base}/workouts`, { params });
  }

  getWorkout(id: string): Observable<ApiResponse<IWorkout>> {
    return this.http.get<ApiResponse<IWorkout>>(`${this.base}/workouts/${id}`);
  }

  createWorkout(body: ICreateWorkout): Observable<ApiResponse<IWorkout>> {
    return this.http.post<ApiResponse<IWorkout>>(`${this.base}/workouts`, body);
  }

  updateWorkout(id: string, body: Partial<ICreateWorkout>): Observable<ApiResponse<IWorkout>> {
    return this.http.put<ApiResponse<IWorkout>>(`${this.base}/workouts/${id}`, body);
  }

  deleteWorkout(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.base}/workouts/${id}`);
  }

  // --- Progress Metrics ---

  getProgressMetrics(query?: IProgressMetricQuery): Observable<ApiResponse<IProgressMetric[]>> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<IProgressMetric[]>>(`${this.base}/progress-metrics`, { params });
  }

  getProgressMetric(id: string): Observable<ApiResponse<IProgressMetric>> {
    return this.http.get<ApiResponse<IProgressMetric>>(`${this.base}/progress-metrics/${id}`);
  }

  getLatestMetrics(): Observable<ApiResponse<IProgressMetric[]>> {
    return this.http.get<ApiResponse<IProgressMetric[]>>(`${this.base}/progress-metrics/latest`);
  }

  getMetricsByType(metricType: string, startDate?: string, endDate?: string): Observable<ApiResponse<IProgressMetric[]>> {
    const params = this.buildParams({ startDate, endDate });
    return this.http.get<ApiResponse<IProgressMetric[]>>(`${this.base}/progress-metrics/by-type/${metricType}`, { params });
  }

  createProgressMetric(body: ICreateProgressMetric): Observable<ApiResponse<IProgressMetric>> {
    return this.http.post<ApiResponse<IProgressMetric>>(`${this.base}/progress-metrics`, body);
  }

  updateProgressMetric(id: string, body: Partial<ICreateProgressMetric>): Observable<ApiResponse<IProgressMetric>> {
    return this.http.put<ApiResponse<IProgressMetric>>(`${this.base}/progress-metrics/${id}`, body);
  }

  deleteProgressMetric(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.base}/progress-metrics/${id}`);
  }

  // --- Running Logs ---

  getRunningLogs(query?: IRunningLogQuery): Observable<ApiResponse<IRunningLog[]>> {
    const params = this.buildParams(query);
    return this.http.get<ApiResponse<IRunningLog[]>>(`${this.base}/running-logs`, { params });
  }

  getRunningLog(id: string): Observable<ApiResponse<IRunningLog>> {
    return this.http.get<ApiResponse<IRunningLog>>(`${this.base}/running-logs/${id}`);
  }

  getRunningLogsByWorkout(workoutId: string): Observable<ApiResponse<IRunningLog[]>> {
    return this.http.get<ApiResponse<IRunningLog[]>>(`${this.base}/running-logs/workout/${workoutId}`);
  }

  getPersonalBests(): Observable<ApiResponse<IPersonalBests>> {
    return this.http.get<ApiResponse<IPersonalBests>>(`${this.base}/running-logs/personal-bests`);
  }

  createRunningLog(body: ICreateRunningLog): Observable<ApiResponse<IRunningLog>> {
    return this.http.post<ApiResponse<IRunningLog>>(`${this.base}/running-logs`, body);
  }

  updateRunningLog(id: string, body: Partial<ICreateRunningLog>): Observable<ApiResponse<IRunningLog>> {
    return this.http.put<ApiResponse<IRunningLog>>(`${this.base}/running-logs/${id}`, body);
  }

  deleteRunningLog(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.base}/running-logs/${id}`);
  }

  // --- Workout Exercises ---

  getWorkoutExercises(workoutId?: string): Observable<ApiResponse<IWorkoutExercise[]>> {
    const params = this.buildParams({ workoutId });
    return this.http.get<ApiResponse<IWorkoutExercise[]>>(`${this.base}/workout-exercises`, { params });
  }

  getWorkoutExercisesByWorkout(workoutId: string): Observable<ApiResponse<IWorkoutExercise[]>> {
    return this.http.get<ApiResponse<IWorkoutExercise[]>>(`${this.base}/workout-exercises/workout/${workoutId}`);
  }

  createWorkoutExercise(body: ICreateWorkoutExercise): Observable<ApiResponse<IWorkoutExercise>> {
    return this.http.post<ApiResponse<IWorkoutExercise>>(`${this.base}/workout-exercises`, body);
  }

  updateWorkoutExercise(id: string, body: Partial<ICreateWorkoutExercise>): Observable<ApiResponse<IWorkoutExercise>> {
    return this.http.put<ApiResponse<IWorkoutExercise>>(`${this.base}/workout-exercises/${id}`, body);
  }

  deleteWorkoutExercise(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.base}/workout-exercises/${id}`);
  }

  // --- Helpers ---

  private buildParams(query?: object | null): HttpParams {
    let params = new HttpParams();
    if (!query) {
      return params;
    }
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}
