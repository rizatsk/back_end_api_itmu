const routes = (handler) => [
    {
        method: 'GET',
        path: '/authorization',
        handler: handler.getAuthorizationForInsertHandler,
        options: {
            auth: "itindosolution_jwt",
        }
    },
    {
        method: 'GET',
        path: '/authorization/role-user',
        handler: handler.getRoleUsersHandler,
        options: {
            auth: "itindosolution_jwt",
        }
    },
    {
        method: 'POST',
        path: '/authorization/role-user',
        handler: handler.addRoleUserHandler,
        options: {
            auth: "itindosolution_jwt",
        }
    },
    {
        method: 'GET',
        path: '/authorization/role-user/{roleId}',
        handler: handler.getRoleUserByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        }
    },
    {
        method: 'PUT',
        path: '/authorization/role-user/{roleId}',
        handler: handler.updateRoleUserByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        }
    },
    {
        method: 'DELETE',
        path: '/authorization/role-user/{roleId}',
        handler: handler.deleteRoleUserByIdHandler,
        options: {
            auth: "itindosolution_jwt",
        }
    },
]

module.exports = routes;