import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import "./App.css";

const contractAddress = "0x1f3da595edeb28c0d1854dd23e1ae44e61c2e338";

const abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "DonationReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RefundClaimed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "campaigns",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "target",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountCollected",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "image",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "refunded",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "claimRefund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_target",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_image",
        "type": "string"
      }
    ],
    "name": "createCampaign",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "donateToCampaign",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCampaigns",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "owners",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "titles",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "descriptions",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "targets",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "deadlines",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "collected",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "images",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getDonators",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numberOfCampaigns",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Поля формы создания кампании
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [image, setImage] = useState("");

  // Подключение MetaMask и инициализация контракта
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Установите MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
    const instance = new ethers.Contract(contractAddress, abi, signer);
    setContract({ instance, signer });
  };

  // Загрузка всех кампаний
  const loadCampaigns = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      // getCampaigns возвращает массивы: owners, titles, descriptions, targets, deadlines, collected, images
      const [owners, titles, descriptions, targets, deadlines, collected, images] = await contract.instance.getCampaigns();
      const nowTs = Math.floor(Date.now() / 1000);
      const all = [];
      for (let i = 0; i < owners.length; i++) {
        const targetBN = targets[i];
        const collectedBN = collected[i];
        const deadlineTs = deadlines[i].toNumber ? deadlines[i].toNumber() : Number(deadlines[i]);
        // Fetch donators and amounts
        const [donators, donations] = await contract.instance.getDonators(i);
        const donationStr = donations.map(d => ethers.formatEther(d));
        // Определяем, можно ли требовать возврат
        const canRefund = deadlineTs < nowTs && collectedBN < (targetBN);
        all.push({
          id: i,
          owner: owners[i],
          title: titles[i],
          description: descriptions[i],
          target: ethers.formatEther(targetBN),
          collected: ethers.formatEther(collectedBN),
          deadline: new Date(deadlineTs * 1000).toLocaleString(),
          deadlineTs,
          image: images[i],
          donators,
          donations: donationStr,
          canRefund
        });
      }
      setCampaigns(all);
    } catch (err) {
      console.error(err);
      alert("Ошибка загрузки кампаний");
    }
    setLoading(false);
  }, [contract]);

  useEffect(() => {
    if (contract) loadCampaigns();
  }, [contract, loadCampaigns]);

  // Создание новой кампании
  const createCampaign = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const normTarget = target.replace(/,/g, '.').trim();
      const _target = ethers.parseEther(normTarget);
      const _deadline = Math.floor(new Date(deadline).getTime() / 1000);
      const tx = await contract.instance.createCampaign(
        account, title, description, _target, _deadline, image
      );
      await tx.wait();
      setTitle(""); setDescription(""); setTarget(""); setDeadline(""); setImage("");
      await loadCampaigns();
    } catch (err) {
      console.error(err);
      alert("Ошибка создания кампании: " + (err.reason || err.message));
    }
    setLoading(false);
  };

  // Пожертвовать на кампанию
  const donate = async (id) => {
    if (!contract) return;
    const raw = prompt("Enter donation amount in ETH:");
    if (!raw) return;
    const amt = raw.replace(/,/g, '.').trim();
    setLoading(true);
    try {
      const tx = await contract.instance.donateToCampaign(id, { value: ethers.parseEther(amt) });
      await tx.wait();
      await loadCampaigns();
    } catch (err) {
      console.error(err);
      alert("Ошибка пожертвования: " + (err.reason || err.message));
    }
    setLoading(false);
  };

  // Запрос возврата средств
  const claimRefund = async (id) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.instance.claimRefund(id);
      await tx.wait();
      alert("Refund claimed!");
      await loadCampaigns();
    } catch (err) {
      console.error(err);
      alert("Ошибка возврата: " + (err.reason || err.message));
    }
    setLoading(false);
  };

  // Подписка на смену аккаунта
  useEffect(() => {
    const onAccountsChanged = () => connectWallet();
    window.ethereum?.on("accountsChanged", onAccountsChanged);
    return () => window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
  }, []);

  return (
    <div className="App">
      <header className="header">
        <h1>🌐 CrowdFunding DApp</h1>
        {account ? <p>Connected: {account}</p> : <button onClick={connectWallet}>Connect Wallet</button>}
      </header>

      {account && (
        <section className="create-campaign">
          <h2>Create Campaign</h2>
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <input type="text" placeholder="Target (ETH)" value={target} onChange={e => setTarget(e.target.value)} />
          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
          <input type="text" placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} />
          <button disabled={loading || !title || !target || !deadline} onClick={createCampaign}>
            {loading ? "Processing..." : "Create"}
          </button>
        </section>
      )}

      {account && (
        <section className="campaign-list">
          <h2>All Campaigns</h2>
          {loading && <p>Loading campaigns...</p>}
          {!loading && campaigns.length === 0 && <p>No campaigns yet.</p>}
          <div className="campaigns-grid">
            {campaigns.map(c => (
              <div key={c.id} className="campaign-card">
                <img src={c.image} alt={c.title} />
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <p>Target: {c.target} ETH</p>
                <p>Collected: {c.collected} ETH</p>
                <p>Deadline: {c.deadline}</p>
                <button onClick={() => donate(c.id)}>Donate</button>
                {c.canRefund && <button onClick={() => claimRefund(c.id)}>Claim Refund</button>}
                <details>
                  <summary>Donators ({c.donators.length})</summary>
                  <ul>
                    {c.donators.map((d, i) => (
                      <li key={i}>{d} — {c.donations[i]} ETH</li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
