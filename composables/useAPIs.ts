import { ofetch } from "ofetch";
import { useCookies } from "vue3-cookies";
import { useToast } from "@/composables/useToast";

export const useAPIs = (url: any, opts: any = {}) => {
    let config = useRuntimeConfig();
    let { cookies } = useCookies();
    let token = cookies.get(config.public.tokenKey || "token");

    const apiFetch = ofetch.create({
        baseURL: config.public.apiUrl || "http://localhost:8080/v1", // Disesuaikan dengan URL Golang
        onRequest({ options }) {
            if (token) {
                options.headers = { 
                    ...options.headers, 
                    Authorization: `Bearer ${token}` 
                };
            }
        },
        async onResponseError({ response }) {
            // Menangkap pesan error dari struktur JSON backend Golang Anda
            const error = response._data?.data?.error || response._data?.error || response._data?.message || "Terjadi Kesalahan";
            useToast("error", error);
            
            if (response.status === 401) {
                navigateTo("/logout");
            }
        },
    });

    return apiFetch(url, opts);
};