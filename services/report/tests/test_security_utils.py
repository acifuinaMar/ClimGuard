import time
import unittest
from datetime import timezone

import jwt

from app.security import AuthError, authenticate, principal_from_claims, require
from app.utils import fmt_datetime, fmt_num, parse_dt, slugify

KEY, ISS, AUD = "k" * 40, "climguard-auth", "climguard-api"


def tok(**over):
    c = {"sub": "5", "preferred_username": "admin", "role": "Administrador", "iss": ISS, "aud": AUD, "exp": int(time.time()) + 600,
         "permissions": ["reports.generate", "reports.download", "reports.history"]}
    c.update(over)
    return jwt.encode({k: v for k, v in c.items() if v is not None}, KEY, algorithm="HS256")


def auth(h):
    return authenticate(h, key=KEY, issuer=ISS, audience=AUD)


class SecurityTests(unittest.TestCase):
    def test_valid_token(self):
        p = auth(f"Bearer {tok()}")
        self.assertEqual((p.user_id, p.username, p.roles), ("5", "admin", ("Administrador",)))
        self.assertTrue(p.is_admin and p.has("reports.download"))

    def test_missing_or_malformed_header(self):
        for h in (None, "", "Basic abc", "Bearer"):
            with self.assertRaises(AuthError) as c:
                auth(h)
            self.assertEqual(c.exception.status, 401)

    def test_expired(self):
        with self.assertRaises(AuthError) as c:
            auth(f"Bearer {tok(exp=int(time.time()) - 3600)}")
        self.assertEqual((c.exception.status, c.exception.detail), (401, "Token expirado"))

    def test_wrong_issuer_audience_signature(self):
        bad_sig = jwt.encode({"sub": "1", "role": "Administrador", "iss": ISS, "aud": AUD, "exp": int(time.time()) + 60}, "x" * 40, algorithm="HS256")
        for t in (tok(iss="otro"), tok(aud="otro"), bad_sig):
            with self.assertRaises(AuthError) as c:
                auth(f"Bearer {t}")
            self.assertEqual(c.exception.status, 401)

    def test_missing_exp_and_alg_none(self):
        no_exp = jwt.encode({"sub": "1", "role": "Administrador", "iss": ISS, "aud": AUD}, KEY, algorithm="HS256")
        none = jwt.encode({"sub": "1", "role": "Administrador", "iss": ISS, "aud": AUD, "exp": int(time.time()) + 60}, None, algorithm="none")
        for t in (no_exp, none):
            with self.assertRaises(AuthError):
                auth(f"Bearer {t}")

    def test_no_roles_forbidden(self):
        with self.assertRaises(AuthError) as c:
            auth(f"Bearer {tok(role=None)}")
        self.assertEqual(c.exception.status, 403)

    def test_permissions_claim_wins_over_role(self):
        p = auth(f"Bearer {tok(role='Operador', permissions=['reports.generate'])}")
        self.assertTrue(p.has("reports.generate"))
        with self.assertRaises(AuthError) as c:
            require(p, "reports.download")
        self.assertEqual(c.exception.status, 403)

    def test_legacy_claims_and_fallback(self):
        p = principal_from_claims({"nameid": "admin", "role": "Administrador"})
        self.assertEqual(p.username, "admin")
        self.assertTrue(p.has("reports.download"))
        op = principal_from_claims({"nameid": "jdoe", "role": "Operador"})
        self.assertFalse(op.has("reports.download"))
        self.assertTrue(principal_from_claims({"sub": "1", "role": ["Consulta", "Administrador"]}).is_admin)


class UtilsTests(unittest.TestCase):
    def test_parse_dt(self):
        self.assertEqual(parse_dt("2026-10-22T01:00:00.1234567").microsecond, 123456)
        self.assertEqual(parse_dt("2026-10-22T01:00:00").tzinfo, timezone.utc)
        self.assertEqual(parse_dt("2026-10-22T01:00:00-06:00").hour, 7)
        self.assertIsNone(parse_dt("basura"))
        self.assertIsNone(parse_dt(None))

    def test_tz_and_format(self):
        self.assertEqual(fmt_datetime(parse_dt("2026-10-22T01:30:00"), "America/Guatemala"), "21/10/2026 19:30")
        self.assertEqual((fmt_num(1234.5), fmt_num(None), slugify("Estadísticas climáticas")), ("1,234.50", "—", "estadisticas-climaticas"))
