import React, { Component } from "react";
import Layout from "../../components/Layout";
import Campaign from "../../ethereum/campaign";
import { Card, Grid, Button } from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import ContributeForm from "../../components/ContributeForm";
import { Link } from "../../routes";

class CampaignShow extends Component {
  static async getInitialProps(props) {
    const campaign = Campaign(props.query.address);
    const summary = await campaign.methods.getSummary().call();
    return {
      address: props.query.address,
      minimumContribution: summary[0],
      balance: summary[1],
      requestCount: summary[2],
      approversCount: summary[3],
      manager: summary[4],
    };
  }

  renderCards() {
    const {
      minimumContribution,
      balance,
      requestCount,
      approversCount,
      manager,
    } = this.props;

    const items = [
      {
        header: manager,
        meta: "Address of Manager",
        description:
          "The Manager who created this campaign, Manager can create requests to withdraw money.",
        style: { overflowWrap: "break-word" },
      },
      {
        header: minimumContribution,
        meta: "Minimum Contribution (wei)",
        description:
          "You must contribute atleast this much to become an approver",
      },
      {
        header: requestCount,
        meta: "Number of requests",
        description:
          "A request tries to withdraw money from the contract. Requests must be approved by approvers( or contributers)",
      },
      {
        header: approversCount,
        meta: "Number of approvers",
        description:
          "Number of people who have already donated to this campaign.",
      },
      {
        header: web3.utils.fromWei(balance, "ether"),
        meta: "Campaign Balance (ethers)",
        description:
          "The balance is how much money this campaign has to spend.",
      },
    ];

    return <Card.Group items={items} />;
  }
  render() {
    return (
      <Layout>
        <div>
          <h1>Campaign Details</h1>
          <Grid>
            <Grid.Row>
              <Grid.Column mobile={9}>{this.renderCards()}</Grid.Column>
              <Grid.Column mobile={5}>
                <ContributeForm address={this.props.address} />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Link route={`/campaigns/${this.props.address}/requests`}>
                  <a>
                    <Button primary>View Requests</Button>
                  </a>
                </Link>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </Layout>
    );
  }
}

export default CampaignShow;
