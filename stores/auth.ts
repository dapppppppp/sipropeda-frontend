import { defineStore } from "pinia";
import { useToast } from "@/composables/useToast";
import { useAPIs } from "@/composables/useAPIs";
import { useCookies } from "vue3-cookies";

interface authType {
  user?: any;
  token?: any;
  loggedIn?: boolean;
  menus?: Array<any>;
  permissions?: Array<any>;
}

export const useAuthStore = defineStore({
  id: "auth",
  state: (): authType => ({
    user: {},
    token: null,
    loggedIn: false,
    menus: [],
    permissions: [],
  }),
  persist: true,
  actions: {
    async login(payload: any) {
      try {
        const config = useRuntimeConfig();
        const router = useRouter();
        
        // Gunakan vue3-cookies
        const { cookies } = useCookies();

        const response: any = await useAPIs("/login", {
          method: "POST",
          body: payload,
        }).catch((err) => {
          if (err.data) {
            useToast("error", err.data.message || "Koneksi ke server gagal");
          }
          throw err;
        });

        const resData = response?.data ? response.data : response;

        if (resData?.success === false) {
          useToast("error", resData?.message || "Username atau Password salah");
          throw resData;
        }

        // 1. Simpan Token ke Cookie menggunakan vue3-cookies
        cookies.set(config.public.tokenKey || "token", resData.token);

        // 2. Simpan Data ke State Store
        this.user = resData.user || resData;
        this.token = resData.token;
        this.loggedIn = true;

        // 3. Muat Menu Dinamis berdasarkan Role User
        if (this.user?.roleId) {
          await this.loadAuthMenu({ roleId: this.user.roleId });
        }

        // 4. Redirect ke Dashboard
        router.push("/dashboard");
      } catch (err) {
        console.error("error.login", err);
        throw err;
      }
    },

    async logout() {
      const router = useRouter();
      const config = useRuntimeConfig();
      const { cookies } = useCookies();

      // Bersihkan state store
      this.loggedIn = false;
      this.token = null;
      this.user = {};
      this.menus = [];
      this.permissions = [];

      // Bersihkan Cookie dan LocalStorage
      cookies.remove(config.public.tokenKey || "token");
      localStorage.clear();

      // Redirect ke halaman login
      router.push("/login");
    },

    async loadAuthMenu(payload: any) {
      let permissions: any = [];
      try {
        const response: any = await useAPIs("/menu-role", {
          method: "GET",
          params: {
            roleId: payload.roleId,
          },
        });

        let data = response?.data;
        if (!data || !Array.isArray(data)) {
          data = []; 
        }
        
        this.menus = data;

        if (data.length > 0) {
          data.forEach((el: any) => {
            if (el.permissionList) {
              el.permissionList.forEach((els: any) => permissions.push(els));
            }
            if (el.children) {
              el.children.forEach((el2: any) => {
                if (el2.permissionList) {
                  el2.permissionList.forEach((els2: any) => permissions.push(els2));
                }
              });
            }
          });
        }

        this.permissions = permissions;
      } catch (err) {
        console.error("Gagal load menu dinamis", err);
        this.menus = [];
      }
    },

    async fetchUser() {
      try {
        if (this.user?.id) {
          const response: any = await useAPIs(`/user/${this.user.id}`, {
            method: "GET",
          });
          this.user = response?.data || response;
          return response;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    },

    updateUserData(userData: any) {
      this.user = { ...this.user, ...userData };
    },

    updateUserPhoto(photoPath: string) {
      if (this.user) {
        this.user = { ...this.user, foto: photoPath };
      }
    },
  },
  getters: {
    dataUser: (state) => state.user,
    dataMenus: (state) => state.menus,
    dataPermissions: (state) => state.permissions,
    statusLogin: (state) => state.loggedIn,
    getToken: (state) => state.token,
  },
});