import psycopg2
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# --- Cargar variables de entorno ---
load_dotenv()

# --- Conexión a PostgreSQL ---
pg_conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    sslmode="require" if os.getenv("DB_SSL", "false").lower() == "true" else "disable"
)
pg_cur = pg_conn.cursor()

# --- Conexión a Mongo Atlas ---
mongo_uri = os.getenv("MONGO_URI")
mongo_db = os.getenv("MONGO_DB", "db_imc")  # valor por defecto
client = MongoClient(mongo_uri)
db = client[mongo_db]

# Colecciones destino
users_col = db["users"]
imc_col = db["imc"]

# Limpiar colecciones antes de importar (opcional)
users_col.delete_many({})
imc_col.delete_many({})

# --- Migrar tabla users ---
pg_cur.execute("SELECT id, email, password FROM users")
for row in pg_cur.fetchall():
    doc = {
        "_id": row[0],
        "email": row[1],
        "password": row[2]
    }
    users_col.insert_one(doc)

print("✔ Usuarios migrados")

# --- Migrar tabla imc ---
pg_cur.execute("SELECT id, peso, altura, imc, categoria, fecha, user_id FROM imc")
for row in pg_cur.fetchall():
    doc = {
        "_id": row[0],
        "peso": row[1],
        "altura": row[2],
        "imc": row[3],
        "categoria": row[4],
        "fecha": row[5].isoformat() if row[5] else None,  # por si hay NULL
        "user_id": row[6]
    }
    imc_col.insert_one(doc)

print("✔ Registros IMC migrados")

# --- Cerrar conexiones ---
pg_cur.close()
pg_conn.close()
client.close()

print("🚀 Migración completa")
