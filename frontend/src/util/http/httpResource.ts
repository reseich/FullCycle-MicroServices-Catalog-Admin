import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource} from "axios";
import object from "object-to-formdata";

interface QueryParams {
    queryParams?: {
        search?: string | null
        all?: string
        page?: number
        per_page?: number
        sort?: string | null
        dir?: string | null
    }
}

class HttpResource {
    private cancelList: CancelTokenSource | null = null;

    constructor(protected http: AxiosInstance, protected resource: any) {
    }

    list<T = any>(options?: QueryParams): Promise<AxiosResponse<T>> {
        if (this.cancelList) {
            this.cancelList.cancel('list cancelled')
        }
        this.cancelList = axios.CancelToken.source();

        const config: AxiosRequestConfig = {
            cancelToken: this.cancelList.token
        }

        if (options && options.queryParams) {
            config.params = options.queryParams
        }
        return this.http.get<T>(this.resource, config)
    }

    get<T = any>(id: any): Promise<AxiosResponse<T>> {
        return this.http.get<T>(`${this.resource}/${id}`)
    }

    create<T = any>(data: any): Promise<AxiosResponse<T>> {
        let sendData = this.makeSendData(data);
        return this.http.post<T>(this.resource, sendData);
    }

    update<T = any>(id:any, data:any, options?: { http?: { usePost: boolean } }): Promise<AxiosResponse<T>> {
        let sendData = data;
        if (this.containsFile(data)) {
            sendData = this.getFormData(data);
        }
        const {http} = (options || {}) as any;
        return !options || !http || !http.usePost
            ? this.http.put<T>(`${this.resource}/${id}`, sendData)
            : this.http.post<T>(`${this.resource}/${id}`, sendData)
    }

    delete<T = any>(id: any): Promise<AxiosResponse<T>> {
        return this.http.delete<T>(`${this.resource}/${id}`)
    }

    deleteCollection<T = any>(queryParams:any): Promise<AxiosResponse<T>> {
        const config:AxiosRequestConfig = {};
        if (queryParams) {
            config['params'] = queryParams;
        }
        return this.http.delete<T>(`${this.resource}`, config)
    }

    isCancelRequest(error: any) {
        return axios.isCancel(error)
    }

    private makeSendData(data: any) {
        return this.containsFile(data) ? this.getFormData(data) : data;
    }

    private containsFile(data: any) {
        return Object
            .values(data)
            .filter(el => el instanceof File).length !== 0
    }

    private getFormData(data: any) {

        return object.serialize(data, {booleansAsIntegers: true})
    }

}

export default HttpResource;