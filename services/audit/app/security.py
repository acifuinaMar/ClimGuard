"""Validación del contexto de autenticación (§13): firma, issuer, audience, expiración, roles y permisos."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable, Optional

import jwt

_ROLE_URI = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
_NAMEID_URI = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
ADMIN_ROLES = {"administrador", "admin"}

# Solo si el token NO trae el claim `permissions`.
FALLBACK_ROLE_PERMISSIONS: dict[str, set[str]] = {
    "administrador": {"reports.generate", "reports.download", "reports.history", "dashboard.view", "audit.read", "audit.write"},
    "operador": {"dashboard.view", "audit.write"},
    "consulta": {"dashboard.view", "audit.write"},
}


class AuthError(Exception):
    def __init__(self, status: int, detail: str):
        super().__init__(detail)
        self.status, self.detail = status, detail


@dataclass(frozen=True)
class Principal:
    user_id: str
    username: str
    roles: tuple
    permissions: frozenset
    token: str = field(default="", repr=False)

    @property
    def is_admin(self) -> bool:
        return any(r.lower() in ADMIN_ROLES for r in self.roles)

    def has(self, permission: str) -> bool:
        return permission in self.permissions


def _as_list(value: Any) -> list:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, Iterable):
        return [str(v) for v in value]
    return [str(value)]


def principal_from_claims(claims: dict, token: str = "") -> Principal:
    roles = _as_list(claims.get("role") or claims.get("roles") or claims.get(_ROLE_URI))
    user_id = str(claims.get("sub") or claims.get("nameid") or claims.get(_NAMEID_URI) or "")
    username = str(claims.get("preferred_username") or claims.get("unique_name") or claims.get("name")
                   or claims.get("nameid") or claims.get(_NAMEID_URI) or user_id or "desconocido")
    if "permissions" in claims:
        perms = set(_as_list(claims["permissions"]))
    else:
        perms = set()
        for r in roles:
            perms |= FALLBACK_ROLE_PERMISSIONS.get(r.lower(), set())
    return Principal(user_id or username, username, tuple(roles), frozenset(perms), token)


def authenticate(authorization: Optional[str], *, key: str, issuer: str, audience: str) -> Principal:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthError(401, "Bearer token requerido")
    token = authorization[7:].strip()
    try:
        claims = jwt.decode(token, key, algorithms=["HS256"], issuer=issuer, audience=audience,
                            options={"require": ["exp", "iss", "aud"]}, leeway=60)
    except jwt.ExpiredSignatureError:
        raise AuthError(401, "Token expirado")
    except jwt.InvalidTokenError:
        raise AuthError(401, "Token inválido")
    p = principal_from_claims(claims, token)
    if not p.roles:
        raise AuthError(403, "El token no contiene roles")
    return p


def require(principal: Principal, permission: str) -> None:
    if not principal.has(permission):
        raise AuthError(403, f"Permiso requerido: {permission}")
