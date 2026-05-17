import { useAPIs } from "../composables/useAPIs";

const userService = () => {
  const url = "/user";

  // --- Fungsi Auth ---
  async function login(req: any) {
    return useAPIs("/login", {
      method: "POST",
      body: req,
    });
  }

  // --- Fungsi CRUD User ---
  async function retrieve(req?: any) {
    return useAPIs(url, {
      method: "GET",
      params: req,
    });
  }

  async function retrieveById(id: any) {
    return useAPIs(`${url}/${id}`, {
      method: "GET",
    });
  }

  async function save(req: any) {
    if (req.id) {
      return update(req);
    } else {
      return create(req);
    }
  }

  async function create(req: any) {
    return useAPIs(url, {
      method: "POST",
      body: req,
    });
  }

  async function update(req: any) {
    return useAPIs(`${url}/${req.id}`, {
      method: "PUT",
      body: req,
    });
  }

  async function destroy(id: any) {
    return useAPIs(`${url}/${id}`, {
      method: "DELETE",
    });
  }

  // Menambahkan fungsi reset password yang kurang
  async function resetPassword(req: any) {
    return useAPIs(`${url}/reset-password`, {
      method: "PUT",
      body: req,
    });
  }

  return {
    login,
    retrieve,
    retrieveById,
    save,
    create,
    update,
    destroy,
    resetPassword,
  };
};

export default userService;