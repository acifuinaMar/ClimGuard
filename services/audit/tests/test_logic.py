import unittest
from app.logic import build_event, internal_key_ok, scrub, to_bitacora
from app.security import principal_from_claims


class T(unittest.TestCase):
    def test_scrub(self):
        self.assertEqual(scrub({"password": "x", "a": {"Token": "t", "ok": 1}, "l": [{"contraseña": "z"}]}),
                         {"password": "***", "a": {"Token": "***", "ok": 1}, "l": [{"contraseña": "***"}]})

    def test_internal_key(self):
        self.assertTrue(internal_key_ok("abc", "abc"))
        self.assertFalse(internal_key_ok("abd", "abc") or internal_key_ok(None, "abc") or internal_key_ok("", ""))

    def test_bitacora_shape(self):
        b = to_bitacora(build_event("SENSOR_CREATED", "Sensor", {"sensorId": 9, "descripcion": "Sensor creado"}, "5", "admin", "user", None), 1)
        self.assertEqual((b["nombreEntidad"], b["entidadId"], b["usuarioId"], b["descripcion"]), ("Sensor", 9, 5, "Sensor creado"))

    def test_roles(self):
        self.assertTrue(principal_from_claims({"sub": "1", "role": "Administrador"}).has("audit.read"))
        self.assertFalse(principal_from_claims({"sub": "1", "role": "Operador"}).has("audit.read"))
        self.assertTrue(principal_from_claims({"sub": "1", "role": "Operador"}).has("audit.write"))
