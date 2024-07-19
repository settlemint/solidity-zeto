import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Counter", function () {
  async function deployCounterFixture() {
    const counter = await hre.viem.deployContract("Counter");
    const publicClient = await hre.viem.getPublicClient();

    return {
      counter,
      publicClient,
    };
  }

  describe("deployment", function () {
    it("should deploy with a 0 value", async function () {
      const { counter } = await loadFixture(deployCounterFixture);
      const x = await counter.read.number()
      expect(await counter.read.number()).to.equal(0n);
    });
  });

    describe("increment", function () {
      it("should incement with 1", async function () {
        const { counter } = await loadFixture(deployCounterFixture);
        await expect( counter.write.increment()).to.be.fulfilled;
        expect(await counter.read.number()).to.equal(1n);
      });
    });
});
