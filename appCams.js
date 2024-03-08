module.exports = {
	async execute(client, LPRs) {
		const multi = new client.libcurl.Multi()
		const handles = []
		const handlesData = []
		let finished = 0
		if (LPRs.length < 1) {
			console.log(client.chalk.redBright(
				` =>
 * NÃO ENCONTRADAS NOVAS CONEXÕES.
 <=`
			))
			return;
		}

		LPRs.forEach(function (LPR, index) {
			const handle = new client.libcurl.Easy()
			handle.setOpt('URL', `${LPR.protocol_communication}://${LPR.host}:${LPR.port}/${LPR.url_snap}&heartbeat=${LPR.time_pulse}&Events=[${LPR.event_code}]`)
			handle.setOpt("HTTPGET", true);
			handle.setOpt("HTTPAUTH", client.libcurl.CurlAuth.Digest);
			handle.setOpt("USERPWD", `${LPR.user}:${LPR.password}`);
			handle.setOpt("HEADER", 0)
			handle.setOpt("TIMEOUT", 0)
			handle.setOpt("CRLF", 0)
			handle.setOpt(client.libcurl.Curl.option.WRITEFUNCTION, onData)

			handlesData.push([])
			handlesData[index]["temp"] = ""
			handles.push(handle)
			multi.addHandle(handle)
		})

		multi.onMessage((error, handle, errorCode) => {
			console.log(error, handle, errorCode)
			const key = handles.indexOf(handle)
			multi.removeHandle(handle)
			console.log(client.chalk.redBright(
				` =>
 * THREAD FINALIZADA. NOVA TENTATIVA DE CONEXÕES SERAM REALIZADAS.
 <=`
			))
			handle.close()

			if (++finished === LPRs.length) {
				multi.close()
				return;
			}
		})

		function onData(data, n, nmemb) {
			const host = new URL(this.getInfo(client.libcurl.Curl.info.EFFECTIVE_URL).data);
			const key = handles.indexOf(this)
			updStatusHost(key, this.getInfo(client.libcurl.Curl.info.RESPONSE_CODE).data)
			if (this.getInfo(client.libcurl.Curl.info.RESPONSE_CODE).data == "200") {
				const decoder = new client.StringDecoder('latin1');
				let headers = handleResponse(this, decoder.end(data), host, key)
				if (headers.hasOwnProperty(2)) {
					infoEvent = handleInfoEvent(headers, key)
					console.log(client.chalk.greenBright(`
 =>
 * EVENTO RECOLHIDO ${new Date(infoEvent['Events[0].UTC'] * 1000).toLocaleString('pt-BR', { hour12: false, timeZone: "UTC" })}
 * ${LPRs[key].identifier} | ${LPRs[key].description} | Pista: ${infoEvent['Events[0].TrafficCar.Lane']} (${JSON.parse(LPRs[key].direction)[infoEvent['Events[0].TrafficCar.Lane']]})
 * Placa: ${infoEvent['Events[0].TrafficCar.PlateNumber']} | Cor: ${infoEvent['Events[0].TrafficCar.VehicleColor']}
 <=`
					))
					imageBinary = handleImageBinary(headers, key)
					process(infoEvent, imageBinary, key)
				}
			} else {
				console.log(client.chalk.redBright(`
=>
* IMPOSSÍVEL CONECTAR A:
* ${LPRs[key].identifier} | ${LPRs[key].description}
<=`
				))
			}
			return n * nmemb
		}

		function handleResponse(ch, str, host, key) {
			let strDelimeter = str.replace(new RegExp('\r?\n', 'g'), "")
			let strDelimete = strDelimeter.substr(0, LPRs[key].delimiter_tam)
			headers = []
			if (strDelimete == LPRs[key].delimiter) {
				headers = handlesData[key]["temp"].split(LPRs[key].delimiter)
				handlesData[key]["temp"] = ""
				handlesData[key]["temp"] = str
				return headers
			} else {
				handlesData[key]["temp"] = handlesData[key]["temp"] + str
				return headers
			}
		}

		function handleInfoEvent(headers, key) {
			cContLenText = headers[1].length
			cHeadLenText = (LPRs[key].text_header).replace('[content]', cContLenText).length
			stringFinalText = headers[1].substr(cHeadLenText)
			stringFinalText = stringFinalText.split(new RegExp('\r?\n', 'g'))
			let headers_arr = []
			stringFinalText.forEach(function (value) {
				if (false != (matches = value.split('=', 2))) {
					if (matches.hasOwnProperty(1)) {
						headers_arr[matches[0]] = matches[1].trim()
					} else {
						headers_arr[matches[0]] = null
					}
				}
			})
			return headers_arr
		}

		function handleImageBinary(headers, key) {
			cContLenImage = headers[2].length
			cHeadLenImage = (LPRs[key].image_header).replace('[content]', cContLenImage).length
			imageBinary = headers[2].substr(cHeadLenImage)
			return imageBinary
		}

		async function process(infoEvent, imageBinary, key) {
			if (infoEvent.hasOwnProperty('Events[0].TrafficCar.PlateNumber')) {
				const plate = infoEvent['Events[0].TrafficCar.PlateNumber']
				const imageUniq = Math.floor(Date.now() / 100000).toString() + client.randomHash().toString()
				if ((/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/).test(plate) && plate.length == 7) {
					const vehicleId = await checkVehicle(plate, imageUniq, infoEvent)
					if (vehicleId > 0) {
						writeFile("vehicles/" + infoEvent['Events[0].TrafficCar.PlateNumber'] + "/", imageUniq + '.jpg', imageBinary)
						client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'traffic_junction'),
							{
								'config_lpr_intelbrasid': `${LPRs[key].config_lpr_intelbrasid}`,
								'vehiclesid': vehicleId,
								'runway': infoEvent['Events[0].TrafficCar.Lane'],
								'speed': infoEvent['Events[0].Speed'],
								'image': imageUniq + ".jpg",
								'utc': parseInt(infoEvent['Events[0].UTC']) + 10800,
								'date_created': Math.floor(Date.now() / 1000)
							}
						));
					}
				}
			}
		}

		async function checkVehicle(plate, imageUniq, infoEvent) {
			[vehicles] = await client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('getVehiclePlate'), [plate]));
			if (vehicles.length > 0) {
				return vehicles[0].vehiclesid;
			} else {
				[vehicles] = await client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('insert', 'vehicles'),
					{
						plate: plate,
						category: (infoEvent['Events[0].Vehicle.Category'] == "Motorcycle") ? "Motorcycle" : "Automotor",
						color: infoEvent['Events[0].TrafficCar.VehicleColor'],
						image: imageUniq + ".jpg",
						date_created: Math.floor(Date.now() / 1000)
					}
				));
				return vehicles.insertId;
			}
		}

		function writeFile(path, name, binary) {
			if (!client.fs.existsSync(path)) {
				client.fs.mkdirSync(path)
			}
			client.fs.writeFile(path + name, binary, { encoding: 'ascii' }, function (err) {
				client.spawn('cmd', ['/c', "magick", "mogrify", "-resize", "75%", "-quality", "25", path + name]);
			});
		}

		async function updStatusHost(key, http_code) {
			client.connection.promise().query(client.mysql.format(client.prepareSQL.prepared('update', 'config_lpr_intelbras'),
				[
					{
						http_code: http_code,
						last_connection: Math.floor(Date.now() / 1000)
					},
					{
						config_lpr_intelbrasid: LPRs[key].config_lpr_intelbrasid
					}
				]
			));
		}
	}
}