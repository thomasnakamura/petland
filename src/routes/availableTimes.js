var express = require('express');
const axios = require('axios');
const router = express.Router();

const key = 'https://api-homolog.geracaopet.com.br/api/challenges/challenge1';


router.get('/', async (req, res) => {
    try{
        const { data: { employees } } = await axios.get(`${key}/employees/`)
        const numberOfEmployees = employees.length
        
        const firstEmployeeHour = getFirstHour(employees)
        const lastEmployeeHour = getLastHour(employees)
        
        const firstHour = getTimestamp(firstEmployeeHour.startsAt)
        const lastHour = getTimestamp(lastEmployeeHour.finishesAt)
        
        let availableTimes = {}
        const d = new Date(firstHour)
        let currentTime = `${d.getHours().toString().padStart(2, 0)}:${d.getMinutes().toString().padStart(2, 0)}`
        availableTimes[currentTime] = numberOfEmployees

        do {
            d.setMinutes(d.getMinutes() + 30)

            currentTime = `${d.getHours().toString().padStart(2, 0)}:${d.getMinutes().toString().padStart(2, 0)}`

            availableTimes[currentTime] = numberOfEmployees
            
        } while(getTimestamp(currentTime) < lastHour)

        const employeesSchedules = await Promise.all(employees.map(employee => getAppointment(employee.id)))

        employeesSchedules.forEach(employeeSchedule => employeeSchedule.forEach( schedule => {

            const start = getTimestamp(schedule.startsAt)
            const finish = getTimestamp(schedule.finishesAt)

            for (const time in availableTimes) {

                if(getTimestamp(time) >= start && getTimestamp(time) <= finish) {
                    availableTimes[time] -= 1
                }
            }
        }))

        Object.keys(availableTimes).filter( time => availableTimes[time] > 0)

        res.json(Object.keys(availableTimes).filter( time => availableTimes[time] > 0))

    } catch(error) {
        res.json(error);
    }
});

async function getAppointment(id){
    const { data: { appointments } } = await axios.get(`${key}/employee/${id}/appointments`)

    return appointments
}

function getTimestamp(date){
    const dt = new Date(0)
    dt.setHours(...date.split(':'))
    return dt.getTime()
}

function getFirstHour(employees){
    return employees.reduce((p, c) => getTimestamp(p.startsAt) > getTimestamp(c.startsAt) ? c : p)

}

function getLastHour(employees){
    return employees.reduce((p, c) => getTimestamp(p.finishesAt) > getTimestamp(c.finishesAt) ? c : p)

}

module.exports = router;