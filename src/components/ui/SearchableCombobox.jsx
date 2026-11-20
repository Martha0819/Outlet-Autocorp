'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Combobox / Autocomplete interactivo:
 * Permite escribir directamente en el campo para buscar y seleccionar
 * de la lista flotante desplegable.
 */
export function SearchableCombobox({
  options = [], // [{ id, label, sublabel }]
  value = '',
  onChange,
  placeholder = 'Escribe para buscar...',
  required = false,
  disabled = false,
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Encontrar opción actualmente seleccionada
  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.id) === String(value)) || null;
  }, [options, value]);

  // Sincronizar el término de búsqueda con el valor seleccionado cuando no está escribiendo activamente
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? selectedOption.label : '');
    }
  }, [selectedOption, isOpen]);

  // Filtrar opciones según lo que escribe el usuario
  const filteredOptions = useMemo(() => {
    if (!isOpen) return options;
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter((opt) => {
      const matchLabel = (opt.label || '').toLowerCase().includes(q);
      const matchSub = (opt.sublabel || '').toLowerCase().includes(q);
      return matchLabel || matchSub;
    });
  }, [options, searchTerm, isOpen]);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm(selectedOption ? selectedOption.label : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  const handleSelect = (opt) => {
    onChange && onChange(opt ? opt.id : '', opt);
    setSearchTerm(opt ? opt.label : '');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm(selectedOption ? selectedOption.label : '');
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: "'Montserrat', sans-serif",
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          required={required && !value}
          disabled={disabled}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '9px 36px 9px 12px',
            borderRadius: '8px',
            border: isOpen ? '1.5px solid #ff8901' : '1px solid #d5d0ce',
            fontSize: '13px',
            backgroundColor: '#ffffff',
            color: '#251f1d',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
            boxShadow: isOpen ? '0 0 0 3px rgba(255,137,1,0.15)' : 'none',
          }}
        />

        {/* Botón borrar / Flecha desplegable */}
        <div
          style={{
            position: 'absolute',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#8e8784',
            cursor: 'pointer',
          }}
        >
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null);
                inputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                cursor: 'pointer',
                color: '#8e8784',
                fontSize: '14px',
                lineHeight: 1,
              }}
              title="Borrar selección"
            >
              ✕
            </button>
          )}
          <span
            onClick={() => {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            style={{
              fontSize: '11px',
              display: 'inline-block',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              userSelect: 'none',
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Lista flotante de resultados desplegables */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: '220px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e8e6e5',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            zIndex: 2000,
            padding: '4px 0',
          }}
        >
          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: '12px 14px',
                fontSize: '12px',
                color: '#8e8784',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              No se encontraron coincidencias
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = String(opt.id) === String(value);
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={opt.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Previene blur antes del click
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    padding: '8px 14px',
                    cursor: 'pointer',
                    backgroundColor: isHighlighted ? '#fff5eb' : isSelected ? '#faf9f8' : 'transparent',
                    color: isHighlighted ? '#ea580c' : '#251f1d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 600,
                    transition: 'background-color 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{opt.label}</span>
                    {opt.sublabel && (
                      <span style={{ fontSize: '11px', color: isHighlighted ? '#f97316' : '#8e8784', fontWeight: 500 }}>
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span style={{ color: '#ff8901', fontSize: '12px', fontWeight: 800 }}>✓</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
