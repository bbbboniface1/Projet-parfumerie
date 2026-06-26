#!/bin/bash
set -e

MYSQL_DATADIR="/tmp/mysql_data"
MYSQL_SOCKET="/tmp/mysql.sock"
MYSQL_PID="/tmp/mysql.pid"

echo "==> Vérification MySQL..."

if [ ! -d "$MYSQL_DATADIR" ]; then
    echo "==> Initialisation du répertoire MySQL..."
    mkdir -p "$MYSQL_DATADIR"
    mysqld --initialize-insecure --user=runner --datadir="$MYSQL_DATADIR" 2>&1 | tail -5
    echo "==> Initialisation terminée"
fi

if ! mysqladmin --socket="$MYSQL_SOCKET" ping --silent 2>/dev/null; then
    echo "==> Démarrage de MySQL..."
    mysqld --user=runner \
           --socket="$MYSQL_SOCKET" \
           --pid-file="$MYSQL_PID" \
           --datadir="$MYSQL_DATADIR" \
           --port=3306 \
           --bind-address=127.0.0.1 \
           --skip-networking=OFF \
           2>/tmp/mysql_error.log &
    
    echo "==> Attente de MySQL..."
    for i in $(seq 1 30); do
        if mysqladmin --socket="$MYSQL_SOCKET" ping --silent 2>/dev/null; then
            echo "==> MySQL prêt!"
            break
        fi
        sleep 1
    done
fi

echo "==> Import de la base de données..."
mysql --socket="$MYSQL_SOCKET" -u root < /home/runner/workspace/db/init.sql 2>/dev/null || echo "==> DB déjà initialisée"

export DB_SOCKET="$MYSQL_SOCKET"

echo "==> Démarrage du serveur Node.js..."
node /home/runner/workspace/server.js
