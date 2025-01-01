function addItemRow() {
    const table = document.querySelector('#items-table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
<td><input type="text" placeholder="Item Name"></td>
<td><input type="number" placeholder="Price" min="0" oninput="updateTotalAmount()"></td>
<td><button onclick="deleteRow(this)">Delete</button></td>
`;
    table.appendChild(row);
}

function addParticipantRow() {
    const table = document.querySelector('#participants-table tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
<td><input type="text" placeholder="Name"></td>
<td><input type="number" placeholder="Contribution" min="0"></td>
<td><button onclick="deleteRow(this)">Delete</button></td>
`;
    table.appendChild(row);
}

function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.remove();
    updateTotalAmount(); // Ensure the total updates after row deletion
}


function updateTotalAmount() {
    const items = document.querySelectorAll('#items-table tbody tr');
    const totalCost = Array.from(items).reduce((sum, row) => {
        const price = parseFloat(row.children[1].querySelector('input').value) || 0;
        return sum + price;
    }, 0);

    // Update the displayed total cost dynamically
    const totalDisplay = document.getElementById('total-cost');
    if (!totalDisplay) {
        const header = document.querySelector('.container');
        const total = document.createElement('p');
        total.id = 'total-cost';
        total.textContent = `Total Cost: ₹${totalCost}`;
        header.appendChild(total);
    } else {
        totalDisplay.textContent = `Total Cost: ₹${totalCost}`;
    }
}

function calculate() {
    const items = [];
    document.querySelectorAll('#items-table tbody tr').forEach(row => {
        const itemName = row.children[0].querySelector('input').value;
        const price = parseFloat(row.children[1].querySelector('input').value) || 0;
        items.push({ itemName, price });
    });

    const participants = [];
    document.querySelectorAll('#participants-table tbody tr').forEach(row => {
        const name = row.children[0].querySelector('input').value;
        const contribution = parseFloat(row.children[1].querySelector('input').value) || 0;
        participants.push({ name, contribution });
    });

    const totalCost = items.reduce((sum, item) => sum + item.price, 0);
    const totalContribution = participants.reduce((sum, participant) => sum + participant.contribution, 0);

    if (totalCost !== totalContribution) {
        alert(`Mismatch: Total Cost (₹${totalCost}) does not equal Total Contributions (₹${totalContribution}).`);
        return;
    }

    const equalShare = totalCost / participants.length;

    const balances = participants.map(participant => ({
        name: participant.name,
        balance: participant.contribution - equalShare,
    }));

    displayResults(items, participants, balances, totalCost, equalShare);
}

function displayResults(items, participants, balances, totalCost, equalShare) {
    document.getElementById('result-section').classList.remove('hidden');

    const itemsList = document.querySelector('#items-summary ul');
    itemsList.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.itemName}: ₹${item.price}`;
        itemsList.appendChild(li);
    });

    const participantsList = document.querySelector('#participants-summary ul');
    participantsList.innerHTML = '';
    participants.forEach(participant => {
        const li = document.createElement('li');
        li.textContent = `${participant.name}: ₹${participant.contribution}`;
        participantsList.appendChild(li);
    });

    const calculationList = document.querySelector('#calculation-summary ul');
    calculationList.innerHTML = '';
    balances.forEach(balance => {
        const status = balance.balance > 0 ? 'gets back' : 'Give';
        const li = document.createElement('li');
        li.textContent = `${balance.name} ${status}: ₹${Math.abs(balance.balance).toFixed(2)}`;
        calculationList.appendChild(li);
    });

    const detailList = document.createElement('ul');
    balances.forEach(payer => {
        if (payer.balance < 0) {
            balances.forEach(receiver => {
                if (receiver.balance > 0) {
                    const amount = Math.min(receiver.balance, Math.abs(payer.balance));
                    const li = document.createElement('li');
                    li.textContent = `${payer.name} Give ₹${amount.toFixed(2)} to ${receiver.name}`;
                    detailList.appendChild(li);

                    payer.balance += amount;
                    receiver.balance -= amount;
                }
            });
        }
    });

    const detailView = document.createElement('div');
    detailView.id = 'detailed-view';
    detailView.innerHTML = `<h4>Detailed Transactions:</h4>`;
    detailView.appendChild(detailList);

    const resultSection = document.getElementById('result-section');
    if (document.getElementById('detailed-view')) {
        document.getElementById('detailed-view').remove();
    }
    resultSection.appendChild(detailView);
}