import { useAPIs } from "../composables/useAPIs";

const menuService = () => {
  const urlMenu = "/menu";
  const urlMenuRole = "/menu-role";
  
  // ==========================================
  // --- Master Menu CRUD ---
  // ==========================================

  // Mendapatkan data menu dengan pagination dan pencarian
  async function retrieve(req?: any) {
    return useAPIs(urlMenu, {
      method: "GET",
      params: req,
    });
  }

  // Mendapatkan seluruh data menu tanpa pagination
  async function retrieveAll() {
    return useAPIs(`${urlMenu}/all`, {
      method: "GET",
    });
  }

  // Mendapatkan detail satu menu berdasarkan ID
  async function retrieveById(id: string) {
    return useAPIs(`${urlMenu}/${id}`, {
      method: "GET",
    });
  }

  // Fungsi helper untuk menentukan create atau update
  async function save(req: any) {
    if (req.id) {
      return update(req);
    } else {
      return create(req);
    }
  }

  async function create(req: any) {
    return useAPIs(urlMenu, {
      method: "POST",
      body: req,
    });
  }

  async function update(req: any) {
    return useAPIs(`${urlMenu}/${req.id}`, {
      method: "PUT",
      body: req,
    });
  }

  async function destroy(id: any) {
    return useAPIs(`${urlMenu}/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // --- Menu Role Management ---
  // ==========================================

  // Mendapatkan hierarki menu berdasarkan role (untuk sidebar/navigasi)
  async function retrieveMenuByRole(roleId: string, commodityId?: string) {
    const params: any = { roleId };
    if (commodityId) params.commodityId = commodityId;

    return useAPIs(urlMenuRole, {
      method: "GET",
      params: params,
    });
  }

  // Mendapatkan struktur menu untuk transaksi pengaturan role akses (dengan ActionList)
  async function retrieveMenuByRoleTrx(roleId: string, commodityId?: string) {
    const params: any = { roleId };
    if (commodityId) params.commodityId = commodityId;

    return useAPIs(`${urlMenuRole}/trx`, {
      method: "GET",
      params: params,
    });
  }

  // Menyimpan pemetaan menu dan role sekaligus banyak (Bulk Insert)
  async function saveBulkMenuRole(req: any) {
    return useAPIs(`${urlMenuRole}/bulk`, {
      method: "POST",
      body: req, // Sesuai struct RequestBulkMenuRole (memiliki data array)
    });
  }

  // Memperbarui permission tertentu pada menu-role
  async function updateMenuPermission(req: any) {
    return useAPIs(`${urlMenuRole}/update-permission`, {
      method: "PUT",
      body: req, // Sesuai struct RequestMenuPermissionFormat
    });
  }

  return {
    retrieve,
    retrieveAll,
    retrieveById,
    save,
    create,
    update,
    destroy,
    retrieveMenuByRole,
    retrieveMenuByRoleTrx,
    saveBulkMenuRole,
    updateMenuPermission,
  };
};

export default menuService;