import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  FluidTypography, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4, 
  Heading5, 
  Heading6,
  BodyText,
  SmallText,
  Caption
} from '../FluidTypography';

// Mock the useResponsiveFont hook
jest.mock('../../hooks/useVariableFont', () => ({
  useResponsiveFont: jest.fn(() => ({
    fontSize: 16,
    lineHeight: 1.5,
  })),
}));

describe('FluidTypography', () => {
  it('should render with default props', () => {
    render(
      <FluidTypography>
        Default text
      </FluidTypography>
    );

    const element = screen.getByText('Default text');
    expect(element.tagName).toBe('P');
    expect(element).toHaveClass('font-variable', 'text-fluid-base', 'font-normal');
  });

  it('should render with custom element type', () => {
    render(
      <FluidTypography as="h1" variant="4xl" weight="bold">
        Custom heading
      </FluidTypography>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-fluid-4xl', 'font-bold');
  });

  it('should apply interactive class when interactive prop is true', () => {
    render(
      <FluidTypography interactive>
        Interactive text
      </FluidTypography>
    );

    const element = screen.getByText('Interactive text');
    expect(element).toHaveClass('text-interactive');
  });

  it('should apply responsive styles when responsive prop is true', () => {
    const { useResponsiveFont } = require('../../hooks/useVariableFont');
    useResponsiveFont.mockReturnValue({
      fontSize: 18,
      lineHeight: 1.6,
    });

    render(
      <FluidTypography responsive>
        Responsive text
      </FluidTypography>
    );

    const element = screen.getByText('Responsive text');
    expect(element).toHaveStyle({
      fontSize: '18px',
      lineHeight: 1.6,
    });
  });

  it('should not apply responsive styles when responsive prop is false', () => {
    render(
      <FluidTypography responsive={false}>
        Non-responsive text
      </FluidTypography>
    );

    const element = screen.getByText('Non-responsive text');
    expect(element).not.toHaveStyle({
      fontSize: '18px',
    });
  });

  it('should combine custom className with generated classes', () => {
    render(
      <FluidTypography className="custom-class" variant="xl" weight="semibold">
        Custom class text
      </FluidTypography>
    );

    const element = screen.getByText('Custom class text');
    expect(element).toHaveClass('custom-class', 'font-variable', 'text-fluid-xl', 'font-semibold');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    
    render(
      <FluidTypography ref={ref}>
        Ref text
      </FluidTypography>
    );

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    expect(ref.current?.textContent).toBe('Ref text');
  });

  it('should pass through additional props', () => {
    render(
      <FluidTypography 
        data-testid="fluid-typography"
        aria-label="Fluid typography label"
      >
        Props text
      </FluidTypography>
    );

    const element = screen.getByTestId('fluid-typography');
    expect(element).toHaveAttribute('aria-label', 'Fluid typography label');
  });
});

describe('Predefined Typography Components', () => {
  it('should render Heading1 with correct props', () => {
    render(<Heading1>Heading 1</Heading1>);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-fluid-4xl', 'font-bold');
  });

  it('should render Heading2 with correct props', () => {
    render(<Heading2>Heading 2</Heading2>);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveClass('text-fluid-3xl', 'font-semibold');
  });

  it('should render Heading3 with correct props', () => {
    render(<Heading3>Heading 3</Heading3>);
    
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveClass('text-fluid-2xl', 'font-semibold');
  });

  it('should render Heading4 with correct props', () => {
    render(<Heading4>Heading 4</Heading4>);
    
    const heading = screen.getByRole('heading', { level: 4 });
    expect(heading).toHaveClass('text-fluid-xl', 'font-medium');
  });

  it('should render Heading5 with correct props', () => {
    render(<Heading5>Heading 5</Heading5>);
    
    const heading = screen.getByRole('heading', { level: 5 });
    expect(heading).toHaveClass('text-fluid-lg', 'font-medium');
  });

  it('should render Heading6 with correct props', () => {
    render(<Heading6>Heading 6</Heading6>);
    
    const heading = screen.getByRole('heading', { level: 6 });
    expect(heading).toHaveClass('text-fluid-base', 'font-medium');
  });

  it('should render BodyText with correct props', () => {
    render(<BodyText>Body text</BodyText>);
    
    const paragraph = screen.getByText('Body text');
    expect(paragraph.tagName).toBe('P');
    expect(paragraph).toHaveClass('text-fluid-base');
  });

  it('should render SmallText with correct props', () => {
    render(<SmallText>Small text</SmallText>);
    
    const span = screen.getByText('Small text');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveClass('text-fluid-sm');
  });

  it('should render Caption with correct props', () => {
    render(<Caption>Caption text</Caption>);
    
    const span = screen.getByText('Caption text');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveClass('text-fluid-xs', 'font-light');
  });

  it('should forward refs for all predefined components', () => {
    const h1Ref = React.createRef<HTMLHeadingElement>();
    const bodyRef = React.createRef<HTMLParagraphElement>();
    const spanRef = React.createRef<HTMLSpanElement>();

    render(
      <>
        <Heading1 ref={h1Ref}>H1</Heading1>
        <BodyText ref={bodyRef}>Body</BodyText>
        <SmallText ref={spanRef}>Small</SmallText>
      </>
    );

    expect(h1Ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(bodyRef.current).toBeInstanceOf(HTMLParagraphElement);
    expect(spanRef.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('should accept additional props for predefined components', () => {
    render(
      <Heading1 
        className="custom-heading" 
        data-testid="heading-1"
        interactive
      >
        Custom heading
      </Heading1>
    );

    const heading = screen.getByTestId('heading-1');
    expect(heading).toHaveClass('custom-heading', 'text-interactive');
  });
});