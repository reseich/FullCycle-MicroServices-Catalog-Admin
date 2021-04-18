import {AxiosInstance, AxiosResponse} from "axios";

class HttpResource {

    constructor(protected http: AxiosInstance, protected resource: any) {

    }

    list<T = any>(): Promise<AxiosResponse<T>> {
        return this.http.get<T>(this.resource)
    }

    get<T = any>(id: any): Promise<AxiosResponse<T>> {
        return this.http.get<T>(`${this.resource}/${id}`)
    }

    create<T = any>(data: any): Promise<AxiosResponse<T>> {
        return this.http.post<T>(this.resource, data)
    }

    update<T = any>(id: any, data: any): Promise<AxiosResponse<T>> {
        return this.http.get<T>(`${this.resource}/${id}`, data)
    }

    delete<T = any>(id: any): Promise<AxiosResponse<T>> {
        return this.http.delete<T>(`${this.resource}/${id}`)
    }

}

export default HttpResource;