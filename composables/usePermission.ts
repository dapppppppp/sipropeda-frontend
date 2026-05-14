import { useAuthStore } from "@/stores/auth";
export const usePermission = () => {
    const checkPermission = async (key:any) => {
        const { permissions }: any = useAuthStore();
        if (permissions.length>0) {
            const access = permissions.find((x: any) => x === key)
            if (!access) {
                useToast("error", "Otorisasi menu untuk anda belum di setting");
                return navigateTo("/logout");
            }
        }
    }

    const hasPermission = (key:any) => {
        const { permissions }: any = useAuthStore();
        if (permissions.length>0) {
            const access = permissions.find((x: any) => x === key);
            return access ? true : false;
        } else {
            return true
        }
    }

    return {
        checkPermission,
        hasPermission
    }
}