import { useAPIs } from "../composables/useAPIs";

const menuService = () => {
  const urlMenu = "/menu";
  const urlMenuRole = "/menu-role";
  
  // --- Master Menu CRUD ---
  
  async function retrieve(req?: any) {
    return useAPIs(urlMenu, {
      method: "GET",
      params: req,
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

  // --- Menu Role Management ---

  async function retrieveMenuByRole(roleId: string) {
    return useAPIs(urlMenuRole, {
      method: "GET",
      params: { roleId },
    });
  }

  async function saveBulkMenuRole(req: any) {
    return useAPIs(`${urlMenuRole}/bulk`, {
      method: "POST",
      body: req,
    });
  }

  return {
    retrieve,
    save,
    create,
    update,
    destroy,
    retrieveMenuByRole,
    saveBulkMenuRole,
  };
};

export default menuService;