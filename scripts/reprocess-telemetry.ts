import { reprocessTelemetry } from './src/app/dashboard/orders/actions/telemetry'

// Reprocess the telemetry record
const telemetryId = '4a624320-0c40-4dc1-ac22-c2f5f4e26326'

console.log('🔄 Starting reprocess for:', telemetryId)

reprocessTelemetry(telemetryId)
    .then(result => {
        console.log('✅ Result:', JSON.stringify(result, null, 2))
        process.exit(0)
    })
    .catch(error => {
        console.error('❌ Error:', error)
        process.exit(1)
    })
