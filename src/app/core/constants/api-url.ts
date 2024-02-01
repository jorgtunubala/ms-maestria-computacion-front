import { environment } from "src/environments/environment";

export function backend(path: string): string {
    return environment.api_url.concat(path);
}
