import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export function mockDelay<T>(value: T): Observable<T> {
  return of(value).pipe(delay(0));
}
