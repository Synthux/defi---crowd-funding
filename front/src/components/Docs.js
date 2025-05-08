import React from "react";

export default function Docs() {
  return (
    <div className="docs">
      <h2>Fundoria DApp Documentation</h2>
      
      <h3>1. Project Overview</h3>
      <p>
        The Fundoria DApp is a decentralized crowdfunding platform built on Ethereum. 
        It enables users to create fundraising campaigns, donate Ether to campaigns, and 
        claim refunds if a campaign fails to meet its target by the deadline.
      </p>
      <ul>
        <li><strong>Smart Contract:</strong> <code>CrowdFunding.sol</code> handles campaign creation, donations, and refund logic.</li>
        <li><strong>Frontend:</strong> A React.js application (<code>src/App.js</code>) interacting with the smart contract via ethers.js and MetaMask.</li>
      </ul>

      <h3>2. Functionality</h3>
      <h4>Smart Contract (<code>CrowdFunding.sol</code>)</h4>
      <ul>
        <li>
          <code>createCampaign</code><br/>
          Registers a new campaign; returns its ID.  
          <em>Revert:</em> Deadline must be in the future.
        </li>
        <li>
          <code>donateToCampaign</code><br/>
          Accepts Ether; updates campaign’s collected amount and donor balances.  
          <em>Revert:</em> Campaign must be active; donation must be &gt; 0.
        </li>
        <li>
          <code>getDonators</code><br/>
          Returns arrays of donor addresses and amounts for a campaign.
        </li>
        <li>
          <code>getCampaigns</code><br/>
          Returns list of all campaigns with full metadata.
        </li>
        <li>
          <code>claimRefund</code><br/>
          Allows donors to reclaim contributions if the campaign missed its goal.  
          <em>Revert:</em> Must be after deadline; campaign failed; donor has balance.
        </li>
      </ul>

      <h4>Frontend (React + ethers.js)</h4>
      <ul>
        <li><strong>Wallet Connection:</strong> Uses <code>ethers.BrowserProvider</code> to connect MetaMask.</li>
        <li><strong>Create Campaign:</strong> Form collects details; uses <code>ethers.parseEther</code>.</li>
        <li><strong>List Campaigns:</strong> Fetches on-chain data and displays it in cards.</li>
        <li><strong>Donate:</strong> Prompt-based Ether input, calls <code>donateToCampaign</code>.</li>
        <li><strong>Claim Refund:</strong> Shows button for failed campaigns, calls <code>claimRefund</code>.</li>
      </ul>

      <h3>3. Deployment & Usage</h3>
      <ol>
        <li>Compile & deploy <code>CrowdFunding.sol</code> via Hardhat or Truffle.</li>
        <li>Fill <code>contractAddress</code> and <code>abi</code> in <code>Home.js</code>.</li>
        <li>Run <code>npm start</code> in <code>src/</code>.</li>
        <li>Open browser, connect MetaMask, и пользуйтесь DApp.</li>
      </ol>
      <h3>6. Download</h3>
      <p>
        You can download the full documentation in Word format here:&nbsp;
        <a
          href={`${process.env.PUBLIC_URL}/CrowdFunding_DApp_Documentation.docx`}
          download="CrowdFunding_DApp_Documentation.docx"
        >
          Download Word Document
        </a>
      </p>
    </div>
  );
}
