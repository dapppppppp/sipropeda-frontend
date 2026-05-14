import { defineStore } from "pinia";
import { useCookies } from "vue3-cookies";
import { useToast } from "@/composables/useToast";
import { useAPIs } from "@/composables/useAPIs";

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
        const { cookies } = useCookies();

        // PERBAIKAN 1: Jangan pecah objeknya. Tangkap utuh sebagai "response"
        // PERBAIKAN 2: Endpoint biasanya "/login", bukan "/user/login" di Golang
        const response: any = await useAPIs("/login", {
          method: "POST",
          body: payload,
        }).catch((err) => {
          if (err.data) {
            useToast("error", err.data.message || "Koneksi ke server gagal");
          }
          throw err;
        });

        // PERBAIKAN 3: Deteksi cerdas. Apakah Golang meletakkan data di luar atau dibungkus "data"
        const resData = response?.data ? response.data : response;

        if (resData?.success === false) {
          useToast("error", resData?.message || "Username atau Password salah");
          throw resData;
        }

        // PERBAIKAN 1: Gunakan useCookie Nuxt
        const tokenCookie = useCookie(config.public.tokenKey || "token");
        
        // PERBAIKAN 2: Golang mengirim token langsung sebagai string (resData.token) 
        // bukan data.token.AccessToken
        tokenCookie.value = resData.token; 
        
        // PERBAIKAN 3: Simpan data User dari Golang (bukan data.user jika strukturnya beda, sesuaikan dengan LoginResponse Golang)
        this.user = resData.user || resData; 
        this.token = resData.token;
        this.loggedIn = true;

        // this.initFCM(); // (Komen dulu jika Firebase belum dipakai)

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

      // Bersihkan state
      this.loggedIn = false;
      this.token = null;
      this.user = {};
      this.menus = [];
      this.permissions = [];

      // Bersihkan penyimpanan lokal
      cookies.remove(config.public.tokenKey || 'token');
      localStorage.clear();

      // Kembalikan ke halaman login
      router.push("/login");
    },

    async loadAuthMenu(payload: any) {
      let permissions: any = [];
      await useAPIs("/menu-role", {
        method: "GET",
        params: {
          roleId: payload.roleId,
        },
      })
        .then((res: any) => {
          const data = res?.data || res || [];
          this.menus = data;
          
          if(Array.isArray(data)) {
              data.forEach((el: any) => {
                if (el.permissionList) {
                  el.permissionList.forEach((els: any) => {
                    permissions.push(els);
                  });
                }
    
                if (el.children) {
                  el.children.forEach((el2: any) => {
                    if (el2.permissionList) {
                      el2.permissionList.forEach((els2: any) => {
                        permissions.push(els2);
                      });
                    }
                  });
                }
              });
          }

          this.permissions = permissions;
        })
        .catch((err) => {
          console.error("Gagal load menu", err);
          return err;
        });
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