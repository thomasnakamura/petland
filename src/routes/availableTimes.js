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
        
        const firstHour = getTime(firstEmployeeHour.startsAt)
        const lastHour = getTime(lastEmployeeHour.finishesAt)
        
        let availableTimes = {}
        const d = new Date(firstHour)
        let currentTime = `${d.getHours().toString().padStart(2, 0)}:${d.getMinutes().toString().padStart(2, 0)}`
        availableTimes[currentTime] = numberOfEmployees

        do {
            d.setMinutes(d.getMinutes() + 30)
            
            currentTime = `${d.getHours().toString().padStart(2, 0)}:${d.getMinutes().toString().padStart(2, 0)}`

            availableTimes[currentTime] = numberOfEmployees
            
        } while(getTime(currentTime) < lastHour)

        const employeesSchedules = await Promise.all(employees.map(employee => getAppointment(employee.id)))

        employeesSchedules.forEach(employeeSchedule => employeeSchedule.forEach( schedule => {

            const start = getTime(schedule.startsAt)
            const finish = getTime(schedule.finishesAt)

            for (const time in availableTimes) {

                if(getTime(time) >= start && getTime(time) <= finish) {
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

function getTime(date){
    const dt = new Date(0)
    dt.setHours(...date.split(':'))
    return dt.getTime()
}

function getFirstHour(employees){
    return employees.reduce((p, c) => getTime(p.startsAt) > getTime(c.startsAt) ? c : p)

}

function getLastHour(employees){
    return employees.reduce((p, c) => getTime(p.finishesAt) > getTime(c.finishesAt) ? c : p)

}

module.exports = router;