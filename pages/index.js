import Link from 'next/link'
import Layout from '../components/MyLayout'
import Portfolios from '../components/Portfolios'
import { get } from '../lib/request'
import { isAuthenticated, redirectUnauthenticated } from '../lib/auth'
import { Card, Icon, Image, Grid, Menu, Segment, Header, Container, Divider } from 'semantic-ui-react'
import { getCookieFromBrowser } from "../lib/session"
import { getPortfolios, getFunds } from "../lib/api"

const imageStyle = {
    height: '150px',
    weight: '100%',
    objectFit: 'cover'
}

const slugify = (str) => (str.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')            // Trim - from end of text
)

const PostLink = (props) => (
    <Link as={`/restaurant/${slugify(props.name)}/${props.id}`} href={`/restaurant?id=${props.id}&name=${props.name}`}>
        <Card>
            <Image src={props.img} style={imageStyle} />
            <Card.Content>
                <Card.Header>{props.name}</Card.Header>
                <Card.Meta>
                    <span className='date'>{props.category}</span>
                </Card.Meta>
            </Card.Content>
            <Card.Content extra>
                {props.rating} <Icon name="star" />
            </Card.Content>
        </Card>
    </Link>
)

const Index = (props) => (
    <Layout auth={props.auth} page='HOME'>
        <h1>Your Portfolios</h1>
        <Portfolios portfolios={props.portfolios} funds={props.funds}></Portfolios>
    </Layout>
)

Index.getInitialProps = async function(context) {
    if (redirectUnauthenticated('/user/signin', context)) {
        return {}
    }

    const portfolios = await getPortfolios(context)
    const funds = await getFunds()
    
    return {
        portfolios,
        funds,
        auth: isAuthenticated(context)
    }
  }

export default Index