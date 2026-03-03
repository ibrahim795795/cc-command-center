import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Clearing old data...')
    await prisma.document.deleteMany()
    await prisma.bonus.deleteMany()
    await prisma.card.deleteMany()
    await prisma.pointsBalance.deleteMany()

    console.log('Seeding points...')
    await prisma.pointsBalance.createMany({
        data: [
            { program: 'Amex Membership Rewards', balance: 154000, notes: 'Saving for ANA First Class' },
            { program: 'Chase Ultimate Rewards', balance: 83000 },
            { program: 'Aeroplan', balance: 45000, notes: 'Expires soon' },
        ]
    })

    console.log('Seeding cards...')

    // Create an active, fee paying card
    const c1 = await prisma.card.create({
        data: {
            nickname: 'Amex Gold Personal',
            issuer: 'Amex',
            network: 'Amex',
            pointsProgram: 'Amex MR',
            last4: '1001',
            annualFeeAmount: 250,
            annualFeeWaived: false,
            annualFeeNegotiated: false,
            nextAnnualFeeDate: new Date(new Date().setFullYear(new Date().getFullYear(), new Date().getMonth() + 2, 10)),
            statementCloseDate: 15,
            paymentDueDate: 5,
            creditLimit: null, // Charge card
            status: 'Active',
            notes: 'My daily driver for food.'
        }
    })

    // Create a negotiated fee card
    const c2 = await prisma.card.create({
        data: {
            nickname: 'Chase Sapphire Reserve',
            issuer: 'Chase',
            network: 'Visa',
            pointsProgram: 'Chase UR',
            last4: '9921',
            annualFeeAmount: 550,
            annualFeeWaived: false,
            annualFeeNegotiated: true,
            negotiatedSavingsAmount: 150,
            negotiatedNewFeeAmount: 400,
            retentionMethod: 'Retention Offer',
            nextAnnualFeeDate: new Date(new Date().setFullYear(new Date().getFullYear(), new Date().getMonth() + 5, 20)),
            statementCloseDate: 28,
            paymentDueDate: 25,
            creditLimit: 25000,
            status: 'Active',
        }
    })

    // Create a waived fee card
    const c3 = await prisma.card.create({
        data: {
            nickname: 'Hilton Aspire',
            issuer: 'Amex',
            network: 'Amex',
            pointsProgram: 'Hilton Honors',
            last4: '4432',
            annualFeeAmount: 550,
            annualFeeWaived: true,
            negotiatedNewFeeAmount: 0,
            retentionMethod: 'Promo',
            nextAnnualFeeDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1, 1, 1)),
            statementCloseDate: 2,
            paymentDueDate: 28,
            creditLimit: 15000,
            status: 'Active',
        }
    })

    console.log('Seeding bonuses...')
    await prisma.bonus.create({
        data: {
            cardId: c1.id,
            offerName: '90k MR for $4k spend',
            minSpendAmount: 4000,
            spendDeadlineDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            currentSpendProgress: 1200,
            bonusExpected: 90000,
            bonusPosted: false,
            statusPipeline: 'In progress'
        }
    })

    await prisma.bonus.create({
        data: {
            cardId: c3.id,
            offerName: '150k limit sign up',
            minSpendAmount: 4000,
            spendDeadlineDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            currentSpendProgress: 4000,
            bonusExpected: 150000,
            bonusPosted: true,
            postedDate: new Date(),
            statusPipeline: 'Posted'
        }
    })

    console.log('Database seeded successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
