#!/usr/bin/env bash
# Pruebas que NO requieren Docker ni acceso a registries. Ejecutar desde la raíz del proyecto.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0
echo "== Report (unittest)";  (cd services/report && python3 -m unittest discover -s tests -t . 2>&1 | tail -3) || fail=1
echo "== Audit (unittest)";   (cd services/audit  && python3 -m unittest discover -s tests -t . 2>&1 | tail -3) || fail=1
echo "== Auth (tsc + node:test, módulos puros)"
TYPES=$( [ -d services/auth/node_modules/@types ] && echo "$PWD/services/auth/node_modules/@types" || echo "${NODE_TYPES_DIR:-/opt/npm-tools/node_modules/@types}" )
export TYPES
(cd services/auth && rm -rf /tmp/auth-test && cat > /tmp/tsconfig.auth.json <<JSON
{"compilerOptions":{"module":"commonjs","target":"ES2022","strict":true,"esModuleInterop":true,"skipLibCheck":true,"outDir":"/tmp/auth-test","rootDir":"$PWD","typeRoots":["$TYPES"],"types":["node"]},"files":["$PWD/test/common.test.ts"]}
JSON
 tsc -p /tmp/tsconfig.auth.json && node --test /tmp/auth-test/test/common.test.js 2>&1 | grep -E "^# (tests|pass|fail)") || fail=1
echo "== Alert (javac + java, evaluador de reglas)"
(mkdir -p /tmp/alert-test && cd services/alert && javac -d /tmp/alert-test src/main/java/com/climguard/alert/RuleEvaluator.java src/test/java/com/climguard/alert/RuleEvaluatorSelfTest.java 2>&1 | grep -v Picked; java -cp /tmp/alert-test com.climguard.alert.RuleEvaluatorSelfTest 2>&1 | grep -c "^OK" | sed 's/$/ comprobaciones OK/') || fail=1
echo "== docker-compose.yml / k8s (sintaxis YAML)"
python3 -c "import yaml;yaml.safe_load(open('docker-compose.yml'));list(yaml.safe_load_all(open('k8s/climguard.yaml')));print('YAML OK')" || fail=1
exit $fail
