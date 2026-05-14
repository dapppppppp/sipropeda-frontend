import { ofetch } from "ofetch";
import { useRuntimeConfig, useCookie, navigateTo } from "#app";
import { useToast } from "@/composables/useToast";

export const useAPIs = (url: any, opts: any = {}) => {
    const config = useRuntimeConfig();
    
    // GUNAKAN useCookie BAWAAN NUXT (Tahan Banting saat Refresh/SSR)
    const token = useCookie(config.public.tokenKey || "token");
    const backendUrl = config.public.apiUrl || "http://localhost:8080/v1";

    const apiFetch = ofetch.create({
        baseURL: backendUrl, 
        onRequest({ options }) {
            // Baca langsung dari .value
            if (token.value) {
                options.headers = { 
                    ...options.headers,
                    Authorization: `Bearer ${token.value}` 
                };
            }
        },
        async onResponseError({ response }) {
            const error = response._data?.error || response._data?.message || "Terjadi Kesalahan";
            console.error("API Error:", error);
            
            if (response.status === 401) {
                useToast("error", "Sesi telah berakhir, silakan login kembali.");
                // Hapus token jika expired
                token.value = null; 
                navigateTo("/logout");
            }
        },
    });

    return apiFetch(url, opts);
}