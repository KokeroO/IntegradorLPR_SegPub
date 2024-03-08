module.exports = {
    prepared(name, table) {
        if (table) {
            return cachePrepares[name].replace('[table]', table)
        }
        return cachePrepares[name]
    }

}
const cachePrepares = []
function prepare(name, query) {
    cachePrepares[name] = query
}

prepare('insert',
    `INSERT INTO [table] SET ?`
)

prepare('update',
    `UPDATE [table] SET ? WHERE ?`
)

prepare('validToken',
    `SELECT * FROM config_system WHERE config_system.token = ? AND config_system.status = 1 `
)

prepare('getVehiclePlate',
    `SELECT * FROM vehicles WHERE vehicles.plate = ?`
)

prepare('getPass',
    `SELECT traffic_junction.image, traffic_junction.vehiclesid, vehicles.plate
    FROM traffic_junction
    LEFT JOIN vehicles ON vehicles.vehiclesid = traffic_junction.vehiclesid
    WHERE traffic_junction.image = ?`
)

prepare('config/integrationEntityActives',
    `SELECT * FROM config_integration_entity WHERE config_integration_entity.status = 1`
)

prepare('config/lprActive',
    `SELECT config_lpr_intelbras.config_lpr_intelbrasid, config_lpr_intelbras.identifier, config_lpr_intelbras.description, config_lpr_intelbras.protocol_communication, config_lpr_intelbras.host, config_lpr_intelbras.port, config_lpr_intelbras.user, config_lpr_intelbras.password, config_lpr_intelbras.latitude, config_lpr_intelbras.direction, config_lpr_intelbras.longitude, config_lpr_intelbras.time_pulse, config_lpr_intelbras.event_code, models_lpr_intelbras.url_snap, models_lpr_intelbras.name_model, models_lpr_intelbras.delimiter, models_lpr_intelbras.delimiter_tam, models_lpr_intelbras.text_header, models_lpr_intelbras.image_header 
    FROM config_lpr_intelbras
    LEFT JOIN models_lpr_intelbras ON models_lpr_intelbras.models_lpr_intelbrasid = config_lpr_intelbras.models_lpr_intelbrasid
    WHERE config_lpr_intelbras.status = ? AND config_lpr_intelbras.last_connection <= ?`
)

prepare('getTrafficIntegrationEntity',
    `SELECT traffic_junction.traffic_junctionid, traffic_junction.vehiclesid, config_lpr_intelbras.latitude, config_lpr_intelbras.longitude, traffic_junction.speed, traffic_junction.image, traffic_junction.utc, vehicles.plate, config_lpr_intelbras.identifier
    FROM traffic_junction
    LEFT JOIN vehicles ON vehicles.vehiclesid = traffic_junction.vehiclesid
    LEFT JOIN config_lpr_intelbras ON config_lpr_intelbras.config_lpr_intelbrasid = traffic_junction.config_lpr_intelbrasid

    WHERE traffic_junction.date_created >= ? AND
    NOT EXISTS 
    (
        SELECT 1 
        FROM traffic_integration_entity
        WHERE traffic_integration_entity.traffic_junctionid = traffic_junction.traffic_junctionid AND traffic_integration_entity.script = ?
    )
    ORDER BY traffic_junction.utc DESC
    LIMIT ?`
)