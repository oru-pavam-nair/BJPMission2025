/**
 * Layout Components Test
 * Simple test component to verify layout components work correctly
 */

import React from 'react';
import {
  Container,
  Section,
  PageWrapper,
  ContentArea,
  SidebarLayout,
  Stack,
  Grid,
  GridItem,
  AutoGrid,
  FlexGrid,
} from './index';

export const LayoutTest: React.FC = () => {
  return (
    <PageWrapper title="Layout Components Test">
      <Section spacing="xl">
        <Container size="2xl">
          <Stack spacing="xl">
            {/* Grid System Test */}
            <ContentArea>
              <Stack spacing="lg">
                <h2 className="ds-text-heading-2">Grid System</h2>
                
                <div>
                  <h3 className="ds-text-body-large ds-m-base">Responsive Grid (4/8/12 columns)</h3>
                  <Grid columns={{ mobile: 4, tablet: 8, desktop: 12 }} gap="base">
                    {Array.from({ length: 12 }, (_, i) => (
                      <GridItem key={i} span={{ mobile: 1, tablet: 2, desktop: 1 }}>
                        <ContentArea padding="sm" background="secondary">
                          <span className="ds-text-small">Item {i + 1}</span>
                        </ContentArea>
                      </GridItem>
                    ))}
                  </Grid>
                </div>

                <div>
                  <h3 className="ds-text-body-large ds-m-base">Auto Grid</h3>
                  <AutoGrid minItemWidth="200px" gap="base">
                    {Array.from({ length: 6 }, (_, i) => (
                      <ContentArea key={i} padding="base" background="tertiary">
                        <span className="ds-text-body">Auto Item {i + 1}</span>
                      </ContentArea>
                    ))}
                  </AutoGrid>
                </div>

                <div>
                  <h3 className="ds-text-body-large ds-m-base">Flex Grid</h3>
                  <FlexGrid justify="between" align="center" gap="base">
                    <ContentArea padding="base" background="secondary">
                      <span className="ds-text-body">Flex Item 1</span>
                    </ContentArea>
                    <ContentArea padding="base" background="secondary">
                      <span className="ds-text-body">Flex Item 2</span>
                    </ContentArea>
                    <ContentArea padding="base" background="secondary">
                      <span className="ds-text-body">Flex Item 3</span>
                    </ContentArea>
                  </FlexGrid>
                </div>
              </Stack>
            </ContentArea>

            {/* Container Sizes Test */}
            <ContentArea>
              <Stack spacing="lg">
                <h2 className="ds-text-heading-2">Container Sizes</h2>
                
                {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
                  <div key={size}>
                    <h3 className="ds-text-body-large ds-m-base">Container {size}</h3>
                    <Container size={size} padding="base">
                      <ContentArea background="secondary">
                        <span className="ds-text-body">
                          Container with size="{size}" - Max width varies by breakpoint
                        </span>
                      </ContentArea>
                    </Container>
                  </div>
                ))}
              </Stack>
            </ContentArea>

            {/* Sidebar Layout Test */}
            <ContentArea>
              <h2 className="ds-text-heading-2 ds-m-base">Sidebar Layout</h2>
              <SidebarLayout
                sidebar={
                  <ContentArea background="secondary">
                    <Stack spacing="base">
                      <h3 className="ds-text-body-large">Sidebar Content</h3>
                      <p className="ds-text-body">This is the sidebar area</p>
                      <ul className="ds-text-small">
                        <li>Navigation Item 1</li>
                        <li>Navigation Item 2</li>
                        <li>Navigation Item 3</li>
                      </ul>
                    </Stack>
                  </ContentArea>
                }
                sidebarWidth="md"
                gap="lg"
              >
                <ContentArea background="tertiary">
                  <Stack spacing="base">
                    <h3 className="ds-text-body-large">Main Content</h3>
                    <p className="ds-text-body">
                      This is the main content area. On mobile, it stacks vertically.
                      On desktop, it displays side by side with the sidebar.
                    </p>
                    <p className="ds-text-body">
                      The layout automatically adapts to different screen sizes
                      using CSS Grid with responsive breakpoints.
                    </p>
                  </Stack>
                </ContentArea>
              </SidebarLayout>
            </ContentArea>

            {/* Stack Layout Test */}
            <ContentArea>
              <h2 className="ds-text-heading-2 ds-m-base">Stack Layout</h2>
              <Stack spacing="lg" align="center">
                <ContentArea background="secondary" className="w-full">
                  <span className="ds-text-body">Stack Item 1 (centered)</span>
                </ContentArea>
                <ContentArea background="tertiary" className="w-full">
                  <span className="ds-text-body">Stack Item 2 (centered)</span>
                </ContentArea>
                <ContentArea background="secondary" className="w-full">
                  <span className="ds-text-body">Stack Item 3 (centered)</span>
                </ContentArea>
              </Stack>
            </ContentArea>
          </Stack>
        </Container>
      </Section>
    </PageWrapper>
  );
};

export default LayoutTest;