#!/usr/bin/env node

/**
 * Setup Validation Script for PoleGuardian Dashboard
 * Validates that all required dependencies and configurations are in place
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('🔍 Validating PoleGuardian Dashboard Setup...\n')

const checks = []

// Check package.json dependencies
function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const requiredDeps = [
      'react',
      'react-dom', 
      'firebase',
      'framer-motion',
      'tailwindcss',
      'recharts',
      'lucide-react'
    ]
    
    const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep])
    
    if (missing.length === 0) {
      checks.push({ name: 'Dependencies', status: '✅', message: 'All required dependencies installed' })
    } else {
      checks.push({ name: 'Dependencies', status: '❌', message: `Missing: ${missing.join(', ')}` })
    }
  } catch (error) {
    checks.push({ name: 'Dependencies', status: '❌', message: 'package.json not found or invalid' })
  }
}

// Check configuration files
function checkConfigFiles() {
  const configFiles = [
    'vite.config.js',
    'tailwind.config.js', 
    'postcss.config.js'
  ]
  
  const missing = configFiles.filter(file => !fs.existsSync(file))
  
  if (missing.length === 0) {
    checks.push({ name: 'Config Files', status: '✅', message: 'All configuration files present' })
  } else {
    checks.push({ name: 'Config Files', status: '❌', message: `Missing: ${missing.join(', ')}` })
  }
}

// Check source structure
function checkSourceStructure() {
  const requiredPaths = [
    'src/App.jsx',
    'src/main.jsx',
    'src/index.css',
    'src/components/ui',
    'src/services/firebase.js'
  ]
  
  const missing = requiredPaths.filter(p => !fs.existsSync(p))
  
  if (missing.length === 0) {
    checks.push({ name: 'Source Structure', status: '✅', message: 'All required source files present' })
  } else {
    checks.push({ name: 'Source Structure', status: '❌', message: `Missing: ${missing.join(', ')}` })
  }
}

// Check UI components
function checkUIComponents() {
  const components = [
    'src/components/ui/Card.jsx',
    'src/components/ui/Button.jsx',
    'src/components/ui/Alert.jsx',
    'src/components/ui/index.js'
  ]
  
  const missing = components.filter(c => !fs.existsSync(c))
  
  if (missing.length === 0) {
    checks.push({ name: 'UI Components', status: '✅', message: 'Glassmorphism UI components created' })
  } else {
    checks.push({ name: 'UI Components', status: '❌', message: `Missing: ${missing.join(', ')}` })
  }
}

// Check Tailwind configuration
function checkTailwindConfig() {
  try {
    const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8')
    
    const hasCustomColors = tailwindConfig.includes('#0b0e14') && 
                           tailwindConfig.includes('#00d4ff') &&
                           tailwindConfig.includes('#00ffff')
    
    const hasGlassEffects = tailwindConfig.includes('glass') &&
                           tailwindConfig.includes('backdrop')
    
    if (hasCustomColors && hasGlassEffects) {
      checks.push({ name: 'Tailwind Theme', status: '✅', message: 'Dark theme and glassmorphism configured' })
    } else {
      checks.push({ name: 'Tailwind Theme', status: '⚠️', message: 'Theme configuration incomplete' })
    }
  } catch (error) {
    checks.push({ name: 'Tailwind Theme', status: '❌', message: 'Cannot read tailwind.config.js' })
  }
}

// Check CSS utilities
function checkCSSUtilities() {
  try {
    const css = fs.readFileSync('src/index.css', 'utf8')
    
    const hasGlassCard = css.includes('.glass-card')
    const hasNeonEffects = css.includes('.neon-glow')
    const hasPrimaryBg = css.includes('#0b0e14') || css.includes('bg-primary')
    
    if (hasGlassCard && hasNeonEffects && hasPrimaryBg) {
      checks.push({ name: 'CSS Utilities', status: '✅', message: 'Glassmorphism utilities implemented' })
    } else {
      checks.push({ name: 'CSS Utilities', status: '⚠️', message: 'Some CSS utilities missing' })
    }
  } catch (error) {
    checks.push({ name: 'CSS Utilities', status: '❌', message: 'Cannot read index.css' })
  }
}

// Check test setup
function checkTestSetup() {
  const testFiles = [
    'src/test/setup.js',
    'src/App.test.jsx',
    'src/components/ui/Card.test.jsx'
  ]
  
  const existing = testFiles.filter(f => fs.existsSync(f))
  
  if (existing.length === testFiles.length) {
    checks.push({ name: 'Test Setup', status: '✅', message: 'Testing framework configured with sample tests' })
  } else if (existing.length > 0) {
    checks.push({ name: 'Test Setup', status: '⚠️', message: `${existing.length}/${testFiles.length} test files present` })
  } else {
    checks.push({ name: 'Test Setup', status: '❌', message: 'No test files found' })
  }
}

// Run all checks
checkDependencies()
checkConfigFiles()
checkSourceStructure()
checkUIComponents()
checkTailwindConfig()
checkCSSUtilities()
checkTestSetup()

// Display results
console.log('📋 Validation Results:\n')
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`)
})

const passed = checks.filter(c => c.status === '✅').length
const warnings = checks.filter(c => c.status === '⚠️').length
const failed = checks.filter(c => c.status === '❌').length

console.log(`\n📊 Summary: ${passed} passed, ${warnings} warnings, ${failed} failed`)

if (failed === 0) {
  console.log('\n🎉 Setup validation completed successfully!')
  console.log('✨ React dashboard foundation is ready for development')
  console.log('\n🚀 Next steps:')
  console.log('   1. Run "npm install" to install dependencies')
  console.log('   2. Update Firebase configuration in src/services/firebase.js')
  console.log('   3. Run "npm run dev" to start development server')
  console.log('   4. Run "npm test" to verify tests are working')
} else {
  console.log('\n⚠️  Some issues found. Please address the failed checks above.')
  process.exit(1)
}