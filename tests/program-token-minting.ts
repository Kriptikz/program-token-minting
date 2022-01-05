import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { ProgramTokenMinting } from '../target/types/program_token_minting';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { assert } from 'chai';

describe('program-token-minting', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ProgramTokenMinting as Program<ProgramTokenMinting>;

  const airdropAmount = 1_000_000_000;

  const payer = anchor.web3.Keypair.generate();
  const mintA = anchor.web3.Keypair.generate();


  it('Airdrops SOL to payer', async () => {
    console.log("Airdropping SOL");

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(payer.publicKey, airdropAmount),
      "confirmed"
    );
    
    let balance = await provider.connection.getBalance(payer.publicKey);

    assert.equal(airdropAmount, balance);

  });

  it('Creates a Mint', async () => {
    const tx = await program.rpc.createMint({
      accounts: {
        mint: mintA.publicKey,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [payer, mintA]
    });

    let account_owner = await (await provider.connection.getAccountInfo(mintA.publicKey)).owner;

    assert.equal(TOKEN_PROGRAM_ID.toString(), account_owner.toString());
  });
});
