import { useAPIs } from "../composables/useAPIs";

const bidangPembangunanService = () => {
  const url = "/bidang-pembangunan";
  
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
  // Tambahkan fungsi khusus untuk melayani Halaman Utama tabel master
  async function retrievePaging(req?: any) {
    return useAPIs(`${url}/page`, {
      method: "GET",
      params: req,
    });
  }
  // Ingat untuk mencantumkan "retrievePaging" di blok "return { ... }" di bagian bawah!
  return {
    retrieve,
    retrieveById,
    save,
    create,
    update,
    destroy,
    retrievePaging,
  };
};

export default bidangPembangunanService;