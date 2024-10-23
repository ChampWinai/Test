import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwG5hUssCcUYqFccfmch3A-JlymuqKc98",
    authDomain: "smart-parking-dc7a2.firebaseapp.com",
    databaseURL: "https://smart-parking-dc7a2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-parking-dc7a2",
    storageBucket: "smart-parking-dc7a2.appspot.com",
    messagingSenderId: "718643257527",
    appId: "1:718643257527:web:127a8bddfaff9961d96d32",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function fetchParkingInfo() {
    const parkingRef = ref(database, 'parking_spaces');
    onValue(parkingRef, (snapshot) => {
        const data = snapshot.val();
        const parkingInfoDiv = document.getElementById('parking-info');
        parkingInfoDiv.innerHTML = '';

        if (data) {
            Object.keys(data).forEach(slot => {
                const slotData = data[slot];
                const slotElement = document.createElement('div');
                slotElement.classList.add('parking-slot', slotData.status);
                
                // Add click event listener
                slotElement.onclick = () => {
                    displayStatusHistory(slot);
                };

                // Populate the slot information with only the number
                slotElement.innerHTML = `
                    ${slot.replace(/\D/g, '')}  <!-- แสดงเฉพาะตัวเลขของ slot -->
                `;
                parkingInfoDiv.appendChild(slotElement);
            });
        } else {
            parkingInfoDiv.innerHTML = '<p>ไม่มีข้อมูลการใช้งานช่องจอด</p>';
        }
    });
}


function displayStatusHistory(slot) {
    const historyInfoDiv = document.getElementById('history-info');
    historyInfoDiv.innerHTML = ''; // Clear previous history

    const historyRef = ref(database, `parking_spaces/${slot}/history`);
    onValue(historyRef, (snapshot) => {
        const history = snapshot.val();
        if (history) {
            // Create table to display history
            const table = document.createElement('table');
            table.classList.add('history-table');

            // Create table header
            const header = document.createElement('tr');
            const headerCell1 = document.createElement('th');
            headerCell1.textContent = "เวลา";
            const headerCell2 = document.createElement('th');
            headerCell2.textContent = "สถานะ";
            header.appendChild(headerCell1);
            header.appendChild(headerCell2);
            table.appendChild(header);

            // Populate the table with history data
            Object.keys(history).forEach(key => {
                const row = document.createElement('tr');
                row.classList.add('history-row'); // เพิ่มคลาสให้กับแถว
                const timeCell = document.createElement('td');
                const statusCell = document.createElement('td');

                timeCell.textContent = history[key].timestamp; // Use the timestamp for time
                statusCell.textContent = history[key].action; // Use the action for status (เข้า/ออก)

                row.appendChild(timeCell);
                row.appendChild(statusCell);
                table.appendChild(row);
            });

            historyInfoDiv.appendChild(table);
        } else {
            historyInfoDiv.innerHTML = `<p>No history available for ${slot}.</p>`;
        }
    });
}

function openGate() {
    update(ref(database, 'gate'), { status: 'open' });
    logParkingAction('เข้า'); // log entry
}

function closeGate() {
    update(ref(database, 'gate'), { status: 'closed' });
    logParkingAction('ออก'); // log exit
}


function switchMode(isAuto) {
    const modeStatus = document.getElementById('mode-status');
    const newMode = isAuto ? 'Auto' : 'Manual';
    modeStatus.textContent = `Current Mode: ${newMode}`;
    update(ref(database, 'mode'), { auto: isAuto });
}

function displayNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Call the function to fetch parking status
fetchParkingInfo();
