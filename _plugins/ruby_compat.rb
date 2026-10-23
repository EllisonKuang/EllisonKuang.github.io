# Compatibility shim for the Liquid version bundled by GitHub Pages.
# Ruby 3.2+ removed Object#tainted?, while Liquid 4.0.3 still checks it.
unless Object.method_defined?(:tainted?)
  class Object
    def tainted?
      false
    end
  end
end
